import Clock = require('@gamestdio/clock');
import {Signal} from '@gamestdio/signals';

import {StateContainer} from '@gamestdio/state-listener';
import * as fossilDelta from 'fossil-delta';
import * as msgpack from './msgpack';

import {Connection} from './Connection';
import {Protocol, StateProtocol} from './Protocol';

import {PeerConnection} from "./PeerConnection";

import {ClientProcess} from '../Process/Client';
import { ProcessManager } from './ProcessManager';
import { encode } from './msgpack';

export enum AreaStatus {
    NOT_IN = 0,
    LISTEN = 1,
    WRITE = 2
}

export interface Area {
    _previousState: any,
    status: AreaStatus,
    state: StateContainer,
    options: any,
    data: any,
    type: string,
}

export type ConnectorAuth = {
    gottiId: string,
    playerIndex: number,
    connectorURL: string,
}

type SystemName = string | number;

export class Connector {
    private messageQueue: any; //todo type
    private id: string;
    private gameId: string;

    // used to indicate current area id the client is writing to.
    private writeAreaId: string | number = null;

    public gottiId: string;
    public playerIndex: number;
    public sessionId: string;

    public options: any;

    private areaData: any;

    public clock: Clock = new Clock(); // experimental
    public remoteClock: Clock = new Clock(); // experimental

    // Public signals
    public onJoinConnector: Signal = new Signal();
    public onEnabledP2P: Signal = new Signal();
    public onNewP2PConnection: Signal = new Signal();
    public onRemovedP2PConnection: Signal = new Signal();

    public onWrite: Signal = new Signal();
    public onListen: Signal = new Signal();
    public onRemoveListen: Signal = new Signal();
    public onStateChange: Signal = new Signal();
    public onMessage: Signal = new Signal();
    public onError: Signal = new Signal();
    public onLeave: Signal = new Signal();
    public onOpen: Signal = new Signal();
    public onInitialArea: Signal = new Signal();

    private process: ClientProcess;

    private areas: {[areaId: string]:  Area} = {};

    public connection: Connection;

    public peerConnections: {[ playerIndex: number]: PeerConnection } = {};
    // adds the system name that requested the peer connection so we call the correct handlers inside the system when we receive a response
    private pendingPeerRequests: {[playerIndex: number ]: (err: any, options: any) => void } = {};
    private peerAckRequestTimeouts: {[playerIndex: number]: any } = {};
    private peerConnectedRequestTimeouts: {[playerIndex: number]: any } = {};

    readonly connectedPeerIndexes: Array<number> = [];

    private _previousState: any;

    private processManager: ProcessManager;
    constructor() {}

    public async connect(connectorAuth: ConnectorAuth, process: ClientProcess, processManager: ProcessManager, areaData, options: any = {}, webSocketProtocol) {
        const { gottiId, playerIndex, connectorURL } = connectorAuth;

        this.gottiId = gottiId;
        this.areaData = areaData;
        this.playerIndex = playerIndex;
        this.processManager = processManager;
        this.process = process;
        this.messageQueue = process.messageQueue;
        let url = this.buildEndPoint(connectorURL, options, webSocketProtocol);
        this.connection = new Connection(url);
        this.connection.onopen = () => {};
        this.connection.onmessage = this.onMessageCallback.bind(this);
        return new Promise((resolve, reject) => {
            this.onJoinConnector.add(joinOptions => {
                return resolve(joinOptions);
            })
        })
    }

    private async handlePeerConnectionRequest(peerIndex, signalData, systemName, incomingRequestOptions?) {
        if(!(this.peerConnections[peerIndex])) {
            // this check may be redundant
            if(!this.pendingPeerRequests[peerIndex]) {
                const response = await this.process.onPeerConnectionRequest(peerIndex, systemName, incomingRequestOptions);
                if(!response) { // our system requester invalidated the connection.
                    this.connection.send([ Protocol.SIGNAL_FAILED, peerIndex]);
                    return;
                }
                this.peerConnections[peerIndex] = new PeerConnection(this.connection, this.playerIndex, peerIndex);
                this.setupPeerConnection(this.peerConnections[peerIndex], peerIndex);
                this.peerConnections[peerIndex].acceptConnection(response);
            } else {
                throw new Error('handle peer connection request error');
            }
        }
        this.handleSignalData(peerIndex, signalData);
    }

    private handleSignalData(peerIndex, signalData) {
        const peerConnection = this.peerConnections[peerIndex];

        if(!peerConnection) {
            console.error('Attempting to handle signal data for non existent peer:', peerIndex);
            return;
        }

        if(signalData.sdp) {
            peerConnection.handleSDPSignal(signalData.sdp)
        } else if (signalData.candidate) {
            peerConnection.handleIceCandidateSignal(signalData.candidate)
        }
    }

    public requestPeerConnection(peerIndex: number, systemName: string | number,  requestOptions, systemRequestCallback, ackTimeout?: number, connectionTimeout?: number) {
        ackTimeout = ackTimeout ? ackTimeout : 3000;
        connectionTimeout = connectionTimeout ? connectionTimeout : 5000;
        let peerConnection = this.peerConnections[peerIndex];
        if(!(peerConnection)) {
            peerConnection = new PeerConnection(this.connection, this.playerIndex, peerIndex);
            this.setupPeerConnection(peerConnection, peerIndex);
            peerConnection.requestConnection(systemName, requestOptions);
            this.peerConnections[peerIndex] = peerConnection;
            this.pendingPeerRequests[peerIndex] = systemRequestCallback;

            this.peerAckRequestTimeouts[peerIndex] = setTimeout(() => {
                peerConnection.onAck.removeAll();
                delete this.peerAckRequestTimeouts[peerIndex];
                this.handlePeerFailure(peerIndex, null, 'Peer connection timed out, never received an acknowledgement back from peer.');
            }, ackTimeout);

            // add the ack callback to remove the timeout
            peerConnection.onAck.addOnce(() => {
                clearTimeout(this.peerAckRequestTimeouts[peerIndex]);
                delete this.peerAckRequestTimeouts[peerIndex];

                // we got the ack, now we want to add a callback for the actual request unless for some reason the
                // peer connection was already connected
                if(!peerConnection.connected) {
                    this.peerConnectedRequestTimeouts[peerIndex] = setTimeout(() => {
                        delete this.peerConnectedRequestTimeouts[peerIndex];
                        this.handlePeerFailure(peerIndex, null, 'Peer connection timed out on actual handshake of webRTC connection');
                    }, connectionTimeout);
                }
            });
        } else {
            throw new Error(`Already existing peer connection for peer:, ${peerIndex}`);
        }
    }

    public stopAllPeerConnections() {
        for(let peerIndex in this.peerConnections) {
            this.peerConnections[peerIndex].destroy();
        }
    }

    public stopPeerConnection(peerIndex) {
        if (this.peerConnections[peerIndex]) {
            this.peerConnections[peerIndex].destroy();
        }
    }

    public joinInitialArea(options?) {
        if(!this.connection ) {
            throw new Error('No connection, can not join an initial area');
        }

        if(this.writeAreaId !== null) {
            throw new Error('Player is already writing to an area.')
        }
        this.connection.send([Protocol.GET_INITIAL_CLIENT_AREA_WRITE, options]);
    }

    public disconnect() {
        this.removeAllListeners();
        this.stopAllPeerConnections();
        this.connection.close();
        this.process = null;
        this.messageQueue = null;
    }

    public sendPeerMessage(peerIndex, message: any) {
        this.peerConnections[peerIndex].send(msgpack.encode(message.type, message.data, message.to, message.from))
    }

    public sendAllPeersMessage(message: any) {
        const len = this.connectedPeerIndexes.length;
        const encoded = msgpack.encode([message.type, message.data, message.to, message.from]);
        for(let i = 0; i < len; i++) {
            this.peerConnections[this.connectedPeerIndexes[i]].send(encoded)
        }
    }

    public sendPeersMessage(peerIndexes: Array<number>, message: any) {
        let len = peerIndexes.length;
        const encoded = msgpack.encode([message.type, message.data, message.to, message.from]);
        for(let i = 0; i < len; i++) {
            this.peerConnections[peerIndexes[i]].send(encoded)
        }
    }

    public sendSystemMessage(message: any): void {
        this.connection.send([ Protocol.SYSTEM_MESSAGE, message.type, message.data, message.to, message.from]);
    }

    public sendImmediateSystemMessage(message: any): void {
        this.connection.send([ Protocol.IMMEDIATE_SYSTEM_MESSAGE, message.type, message.data, message.to, message.from]);
    }

    public get hasJoined() {
        return this.sessionId !== undefined;
    }

    public removeAllListeners() {
        this.onJoinConnector.removeAll();
        this.onStateChange.removeAll();
        this.onMessage.removeAll();
        this.onError.removeAll();
        this.onLeave.removeAll();
    }

    protected onJoin(joinOptions) {
        Object.keys(this.areaData).forEach(areaId => {
            const { data, type } = this.areaData[areaId];
            this.areas[areaId] = {
                _previousState: {},
                status: AreaStatus.NOT_IN,
                state: new StateContainer({}),
                options: {},
                data,
                type,
            };
        });
        this.onJoinConnector.dispatch(joinOptions);
    }

    protected onMessageCallback(event) { // TODO: REFACTOR PROTOCOLS TO USE BITWISE OPS PLS
        const message = msgpack.decode(new Uint8Array(event.data));
        const code = message[0];
        if (code === Protocol.JOIN_CONNECTOR) {
            // [joinOptions]
            this.onJoin(message[1]);
        } else if (code === Protocol.JOIN_CONNECTOR_ERROR) {
            this.onError.dispatch(message[1]);
        } else if (code === Protocol.SET_CLIENT_AREA_WRITE) {
            // newAreaId, options?
            if (this.writeAreaId) {
                this.areas[this.writeAreaId].status = AreaStatus.LISTEN;
            }
            const isInitial = this.writeAreaId === null;
            this.writeAreaId = message[1];
            // if we werent already listening then start the area systems
            if (!(this.areas[message[1]].status === AreaStatus.LISTEN)) {
                this.processManager.startAreaSystems(message[1]);
            }
            this.areas[message[1]].status = AreaStatus.WRITE;
            if (isInitial) {
                this.onInitialArea.dispatch({areaId: message[1], areaOptions: message[2]})
            }
            this.process.dispatchOnAreaWrite(message[1], isInitial, message[2]);
        }
         else if (code === Protocol.ADD_CLIENT_AREA_LISTEN) {
            // areaId, options?
            this.areas[message[1]].status = AreaStatus.LISTEN;
            this.processManager.startAreaSystems(message[1]);
            const { responseOptions, encodedState } = message[2];
            this.process.dispatchOnAreaListen(message[1], encodedState, responseOptions);
        }
        else if (code === Protocol.REMOVE_CLIENT_AREA_LISTEN) {
            this.areas[message[1]].status = AreaStatus.NOT_IN;
            this.process.dispatchOnRemoveAreaListen(message[1], message[2]);
            this.processManager.removeAreaSystems(message[1]);
        } else if (code === Protocol.SYSTEM_MESSAGE) {
            this.messageQueue.addRemote(message[1], message[2], message[3], message[4]);
        } else if (code === Protocol.IMMEDIATE_SYSTEM_MESSAGE) {
            this.messageQueue.instantDispatch({ type: message[1], data: message[2], to: message[3], from: message[4] }, true);
        }
        else if (code === Protocol.AREA_STATE_UPDATE) {
            const updateType = message[1];
            const areaId = message[2];
            if(updateType === StateProtocol.SET) {
                this.setState(message[1], message[2]);
            } else if (updateType === StateProtocol.PATCH) {
                this.patch(message[1], message[2]);
            }
        } else if(code === Protocol.PEER_CONNECTION_REQUEST) {
            // peerIndex, signalData, systemName, incomingRequestOptions?
            this.handlePeerConnectionRequest(message[1], message[2], message[3], message[4]);
        } else if (code === Protocol.SIGNAL_SUCCESS) {
            // fromPeerIndex, signalData
            console.warn('Connector, GOT SIGNAL SUCCESS FROM PLAYER', message[1], 'the signalData was', message[2]);
            this.peerConnections[message[1]] && this.peerConnections[message[1]].checkAck();
            this.handleSignalData(message[1], message[2]);
        } else if (code === Protocol.PEER_REMOTE_SYSTEM_MESSAGE) { // in case were using a dispatch peer message without a p2p connection itll go through the web server
            // [protocol, fromPeerPlayerIndex, msgType, msgData, msgTo, msgFrom]
            this.messageQueue.dispatchPeerMessage(message[1], message[2],  message[3], message[4], message[5])
        } else if(code === Protocol.SIGNAL_FAILED) {
            this.handlePeerFailure(message[1]);
        }
    }
    protected setState( areaId: string, encodedState: Buffer ): void {
        const state = msgpack.decode(encodedState);

        const area = this.areas[areaId];

        area.state.set(state);

        this._previousState = new Uint8Array( encodedState );

        this.onStateChange.dispatch(state);
    }

    protected patch(areaId, binaryPatch) {
        // apply patch
        const area = this.areas[areaId];
        area._previousState = Buffer.from(fossilDelta.apply(area._previousState, binaryPatch));

        // trigger state callbacks
        area.state.set( msgpack.decode(area._previousState) );

        this.onStateChange.dispatch(area.state);
    }

    private buildEndPoint(URL, options: any ={}, protocol) {
        if(protocol !== 'ws:' && protocol !== 'wss:' && protocol !== 'ws' && protocol !== 'wss') {
            throw new Error('websocket protocol must be ws or wss')
        }

        if (protocol === 'ws' || protocol === 'wss') {
            protocol = protocol + ':';
        }
        const params = [ `gottiId=${this.gottiId}`];
        for (const name in options) {
            if (!options.hasOwnProperty(name)) {
                continue;
            }
            params.push(`${name}=${options[name]}`);
        }
        return `${protocol}//${URL}/?${params.join('&')}`;
    }

    private handlePeerFailure(peerIndex, options?: any, err?: string | boolean) {
        const peerConnection = this.peerConnections[peerIndex];
        if(!peerConnection) {
            console.error(`Peer failure for peerIndex ${peerIndex} did not have a correlated peer connection.`);
        } else {
            peerConnection.onConnected.removeAll();
        }

        // check to see if we have a pending request so we can initiate the callback
        if(this.pendingPeerRequests[peerIndex]) {
            err = err ? err : true;
            this.pendingPeerRequests[peerIndex](err, null);
            delete this.pendingPeerRequests[peerIndex];
        }

        if(this.peerAckRequestTimeouts[peerIndex]) {
            clearTimeout(this.peerAckRequestTimeouts[peerIndex]);
            delete this.peerAckRequestTimeouts[peerIndex];
        }
        if (this.peerConnectedRequestTimeouts[peerIndex]) {
            clearTimeout(this.peerConnectedRequestTimeouts[peerIndex]);
            delete this.peerConnectedRequestTimeouts[peerIndex]
        }

        const index = this.connectedPeerIndexes.indexOf(peerIndex);
        if(index > -1) {
            this.connectedPeerIndexes.splice(index, 1);
            if(this.process) {
                this.process.peers = this.connectedPeerIndexes;
                this.process.onPeerDisconnection(peerIndex, options);
            }
        }
        delete this.peerConnections[peerIndex];
        peerConnection.destroy();
    }

    private setupPeerConnection(peerConnection, peerIndex) {
        peerConnection.onConnected.add((options) => {
            if(!this.connectedPeerIndexes.includes(peerIndex)) {
                if(this.pendingPeerRequests[peerIndex]) {
                    this.pendingPeerRequests[peerIndex](null, options)
                }

                // check ack for good measure ;]
                if(this.peerAckRequestTimeouts[peerIndex]) {
                    clearTimeout(this.peerAckRequestTimeouts[peerIndex]);
                    delete this.peerAckRequestTimeouts[peerIndex];
                }
                // this should still be defined..
                if(this.peerConnectedRequestTimeouts[peerIndex]) {
                    clearTimeout(this.peerConnectedRequestTimeouts[peerIndex]);
                    delete this.peerConnectedRequestTimeouts[peerIndex];
                }
                this.connectedPeerIndexes.push(peerIndex);
                this.process.peers = this.connectedPeerIndexes;
                this.process.onPeerConnection(peerIndex, options);
            }
        });

        peerConnection.onDisconnected.add((errorOptions?) => {
            this.handlePeerFailure(peerIndex, errorOptions)
        });

        peerConnection.onMessage.add((data) => {
            this.messageQueue.dispatchPeerMessage(peerIndex, data[0], data[1], data[2], data[3])
        });

        peerConnection.onMissedPing.add((concurrentMissedPings: number) => {
            this.process.onPeerMissedPing(peerIndex, concurrentMissedPings);
        });
    }
}