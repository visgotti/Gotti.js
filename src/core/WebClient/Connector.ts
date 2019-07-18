import Clock = require('@gamestdio/clock');
import {Signal} from '@gamestdio/signals';

import {StateContainer} from '@gamestdio/state-listener';
import * as fossilDelta from 'fossil-delta';
import * as msgpack from './msgpack';

import {Connection} from './Connection';
import {Protocol, StateProtocol} from './Protocol';

import {PeerConnection} from "./PeerConnection";

import {ClientProcess} from '../Process/Client';

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
}

export type ConnectorAuth = {
    gottiId: string,
    playerIndex: number,
    connectorURL: string,
}

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

    private process: ClientProcess;

    private areas: {[areaId: string]:  Area} = {};

    public connection: Connection;

    public peerConnections: {[ playerIndex: number]: PeerConnection } = {};

    private _previousState: any;

    constructor() {}

    public async connect(connectorAuth: ConnectorAuth, process: ClientProcess, options: any = {}) {
        const { gottiId, playerIndex, connectorURL } = connectorAuth;

        this.gottiId = gottiId;
        this.playerIndex = playerIndex;

        this.process = process;
        this.messageQueue = process.messageQueue;

        let url = this.buildEndPoint(connectorURL, options);
        this.connection = new Connection(url);
        this.connection.onopen = () => {};
        this.connection.onmessage = this.onMessageCallback.bind(this);
        return new Promise((resolve, reject) => {
            this.onJoinConnector.add((areaData, joinData) => {
                return resolve({ areaData, joinData });
            })
        })
    }

    public startPeerConnection(peerIndex, signalData: any={}) {
        let peerConnection = this.peerConnections[peerIndex];
        if(!(peerConnection)) {

            console.warn('initializing our peer connection with the peer index as:', peerIndex);

            this.peerConnections[peerIndex] = new PeerConnection(this.connection, this.process, this.playerIndex, peerIndex);
            peerConnection = this.peerConnections[peerIndex];
            peerConnection.startSignaling();


            peerConnection.onDataChannelOpen(() => {
                console.warn('ON DATA CHANNEL OPENE');
                peerConnection.onPeerMessage((data) => {
                    console.error(' running our peer message handler');
                    this.messageQueue.dispatchPeerMessage(peerIndex, data[0], data[1], data[2], data[3])
                })
            });


            peerConnection.onDataChannelClose(() => {
                console.warn('ON CLOSE the peer connections were', peerConnection.opened);
                peerConnection.destroy();
                delete this.peerConnections[peerIndex];
            })
        }
        if(signalData.sdp) {
            peerConnection.handleSDPSignal(signalData.sdp)
        } else if (signalData.candidate) {
            peerConnection.handleIceCandidateSignal(signalData.candidate)
        }
    }

    public stopPeerConnection(peerIndex) {
        const peerConnection = this.peerConnections[peerIndex];
        peerConnection.destroy();
        delete this.peerConnections[peerIndex];
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

    public leave(): void {
        if (this.connection) {
            //     this.connection.send([Protocol.LEAVE_ROOM]);

        } else {
            this.onLeave.dispatch();
        }
    }

    public sendPeerMessage(peerIndex, message: any) {
        console.log('the peer connections was', this.peerConnections[peerIndex]);
        if(this.peerConnections[peerIndex] && this.peerConnections[peerIndex].opened) {
            this.peerConnections[peerIndex].send(message.type, message.data, message.to, message.from)
        } else {// there was no peer connection so we relay it through our servers
            this.connection.send([ Protocol.PEER_REMOTE_SYSTEM_MESSAGE, peerIndex, message.type, message.data, message.to, message.from]);
        }
    }

    public sendAllPeersMessage(message: any) {
        this.sendPeersMessage(message, Object.keys(this.peerConnections))
    }

    public sendPeersMessage(message: any, peerIndexes: any) {
        let peerMessagePayload = [Protocol.PEER_REMOTE_SYSTEM_MESSAGE];
        peerIndexes.forEach(peerIndex => {
            if(this.peerConnections[peerIndex] && this.peerConnections[peerIndex].opened) {
                this.peerConnections[peerIndex].send(message.type, message.data, message.to, message.from)
            } else {// there was no peer connection so we relay it through our servers
                peerMessagePayload = [...peerMessagePayload, peerIndex, message.type, message.data, message.to, message.from];
            }
        });
        if(peerMessagePayload.length > 1) {
            if(peerMessagePayload.length > 6) {
                // multiple peers change the protocol for multiple peers
                peerMessagePayload[0] = Protocol.PEERS_REMOTE_SYSTEM_MESSAGE
            }
            this.connection.send(peerMessagePayload);
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
        //  super.removeAllListeners();
        this.onJoinConnector.removeAll();
        this.onStateChange.removeAll();
        this.onMessage.removeAll();
        this.onError.removeAll();
        this.onLeave.removeAll();
    }

    protected onJoin(areaOptions, joinOptions) {
        this.onJoinConnector.dispatch(areaOptions, joinOptions);
        Object.keys(areaOptions).forEach(areaId => {
            this.areas[areaId] = {
                _previousState: {},
                status: AreaStatus.NOT_IN,
                state: new StateContainer({}),
                options: areaOptions[areaId],
            };
        })
    }

    protected onMessageCallback(event) { // TODO: REFACTOR PROTOCOLS TO USE BITWISE OPS PLS
        const message = msgpack.decode(new Uint8Array(event.data));
        const code = message[0];
        if (code === Protocol.JOIN_CONNECTOR) {
            // [areaOptions, joinOptions]
            this.onJoin(message[1], message[2]);
        } else if (code === Protocol.JOIN_CONNECTOR_ERROR) {
            this.onError.dispatch(message[1]);
        } else if (code === Protocol.SET_CLIENT_AREA_WRITE) {
            // newAreaId, oldAreaId?, options?
            if(message[2]) {
                this.areas[message[1]].status = AreaStatus.LISTEN;
            }
            this.areas[message[1]].status = AreaStatus.WRITE;
            this.process.dispatchOnAreaWrite(message[1], this.writeAreaId === null, message[2]);
            this.writeAreaId = message[1];
        } else if (code === Protocol.ADD_CLIENT_AREA_LISTEN) {
            // areaId, options?
            this.areas[message[1]].status = AreaStatus.LISTEN;
            const { responseOptions, encodedState } = message[2];
            this.process.dispatchOnAreaListen(message[1], encodedState, responseOptions);
        }
        else if (code === Protocol.REMOVE_CLIENT_AREA_LISTEN) {
            this.areas[message[1]].status = AreaStatus.NOT_IN;
            this.process.dispatchOnRemoveAreaListen(message[1], message[2]);
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
        } else if (code === Protocol.SIGNAL_SUCCESS) {
            // fromPeerIndex, signalData
            console.warn('Connector, GOT SIGNAL SUCCESS FROM PLAYER', message[1], 'the signalData was', message[2]);
            this.startPeerConnection(message[1], message[2]);
        }else if (code === Protocol.PEER_REMOTE_SYSTEM_MESSAGE) { // in case were using a dispatch peer message without a p2p connection itll go through the web server
            // [protocol, fromPeerPlayerIndex, msgType, msgData, msgTo, msgFrom]
            console.warn('from peer was', message[1]);
            console.warn('msg type was', message[2]);
            console.warn('data was', message[3]);
            console.warn('to was', message[4]);
            this.messageQueue.dispatchPeerMessage(message[1], message[2],  message[3], message[4], message[5])
        }

        // else if (code === Protocol.LEAVE_ROOM) {
         //   this.leave();
        //  }
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

    private buildEndPoint(URL, options: any ={}) {
        const params = [ `gottiId=${this.gottiId}`];
        for (const name in options) {
            if (!options.hasOwnProperty(name)) {
                continue;
            }
            params.push(`${name}=${options[name]}`);
        }
        return `ws://${URL}/?${params.join('&')}`;
    }
}