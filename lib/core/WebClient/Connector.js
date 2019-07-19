"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Clock = require("@gamestdio/clock");
const signals_1 = require("@gamestdio/signals");
const state_listener_1 = require("@gamestdio/state-listener");
const fossilDelta = require("fossil-delta");
const msgpack = require("./msgpack");
const Connection_1 = require("./Connection");
const Protocol_1 = require("./Protocol");
const PeerConnection_1 = require("./PeerConnection");
var AreaStatus;
(function (AreaStatus) {
    AreaStatus[AreaStatus["NOT_IN"] = 0] = "NOT_IN";
    AreaStatus[AreaStatus["LISTEN"] = 1] = "LISTEN";
    AreaStatus[AreaStatus["WRITE"] = 2] = "WRITE";
})(AreaStatus = exports.AreaStatus || (exports.AreaStatus = {}));
class Connector {
    constructor() {
        // used to indicate current area id the client is writing to.
        this.writeAreaId = null;
        this.clock = new Clock(); // experimental
        this.remoteClock = new Clock(); // experimental
        // Public signals
        this.onJoinConnector = new signals_1.Signal();
        this.onEnabledP2P = new signals_1.Signal();
        this.onNewP2PConnection = new signals_1.Signal();
        this.onRemovedP2PConnection = new signals_1.Signal();
        this.onWrite = new signals_1.Signal();
        this.onListen = new signals_1.Signal();
        this.onRemoveListen = new signals_1.Signal();
        this.onStateChange = new signals_1.Signal();
        this.onMessage = new signals_1.Signal();
        this.onError = new signals_1.Signal();
        this.onLeave = new signals_1.Signal();
        this.onOpen = new signals_1.Signal();
        this.areas = {};
        this.peerConnections = {};
        // adds the system name that requested the peer connection so we call the correct handlers inside the system when we receive a response
        this.pendingPeerConnections = {};
    }
    connect(connectorAuth, process, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { gottiId, playerIndex, connectorURL } = connectorAuth;
            this.gottiId = gottiId;
            this.playerIndex = playerIndex;
            this.process = process;
            this.messageQueue = process.messageQueue;
            let url = this.buildEndPoint(connectorURL, options);
            this.connection = new Connection_1.Connection(url);
            this.connection.onopen = () => { };
            this.connection.onmessage = this.onMessageCallback.bind(this);
            return new Promise((resolve, reject) => {
                this.onJoinConnector.add((areaData, joinData) => {
                    return resolve({ areaData, joinData });
                });
            });
        });
    }
    handleRemoteOffer(peerIndex, systemName, signalData, options) {
        if (!this.peerConnections[peerIndex]) {
            const response = this.process.onPeerConnectionRequested(peerIndex, systemName, options);
            if (response) {
                this.connection.send([113 /* SIGNAL_FAILED */, peerIndex]);
                return;
            }
            this.startPeerConnection(peerIndex, systemName, signalData, options);
        }
    }
    startPeerConnection(peerIndex, systemName, signalData = {}, options) {
        let peerConnection = this.peerConnections[peerIndex];
        if (!(peerConnection)) {
            console.warn('initializing our peer connection with the peer index as:', peerIndex);
            this.pendingPeerConnections[peerIndex] = systemName;
            this.peerConnections[peerIndex] = new PeerConnection_1.PeerConnection(this.connection, this.process, this.playerIndex, peerIndex);
            peerConnection = this.peerConnections[peerIndex];
            peerConnection.startSignaling();
            peerConnection.onDataChannelOpen(() => {
                if (!this.connectedPeerIndexes.includes(peerIndex)) {
                    this.connectedPeerIndexes.push(peerIndex);
                    this.process.onPeerConnection(peerIndex, options);
                }
                delete this.pendingPeerConnections[peerIndex];
                console.warn('ON DATA CHANNEL OPENE');
                peerConnection.onPeerMessage((data) => {
                    console.error(' running our peer message handler');
                    this.messageQueue.dispatchPeerMessage(peerIndex, data[0], data[1], data[2], data[3]);
                });
            });
            peerConnection.onDataChannelClose(() => {
                console.warn('ON CLOSE the peer connections were', peerConnection.opened);
                peerConnection.destroy();
                this.stopPeerConnection(peerIndex);
            });
        }
        if (signalData.sdp) {
            peerConnection.handleSDPSignal(signalData.sdp);
        }
        else if (signalData.candidate) {
            peerConnection.handleIceCandidateSignal(signalData.candidate);
        }
    }
    stopPeerConnection(peerIndex, options) {
        const peerConnection = this.peerConnections[peerIndex];
        delete this.peerConnections[peerIndex];
        const pendingPeerConnectionSystem = this.pendingPeerConnections[peerIndex];
        if (pendingPeerConnectionSystem !== null && pendingPeerConnectionSystem !== undefined) {
            this.process.onPeerConnectionRejected(peerIndex, pendingPeerConnectionSystem);
            delete this.pendingPeerConnections[peerIndex];
        }
        else {
            const inArrayIndex = this.connectedPeerIndexes.indexOf(peerIndex);
            if (inArrayIndex > -1) {
                // player was connected, trigger onPeerDisconnection
                this.process.onPeerDisconnection(peerIndex, options);
                this.connectedPeerIndexes.splice(inArrayIndex, 1);
            }
        }
        if (peerConnection) {
            peerConnection.destroy();
            delete this.peerConnections[peerIndex];
        }
    }
    joinInitialArea(options) {
        if (!this.connection) {
            throw new Error('No connection, can not join an initial area');
        }
        if (this.writeAreaId !== null) {
            throw new Error('Player is already writing to an area.');
        }
        this.connection.send([20 /* GET_INITIAL_CLIENT_AREA_WRITE */, options]);
    }
    leave() {
        if (this.connection) {
            //     this.connection.send([Protocol.LEAVE_ROOM]);
        }
        else {
            this.onLeave.dispatch();
        }
    }
    sendPeerMessage(peerIndex, message) {
        console.log('the peer connections was', this.peerConnections[peerIndex]);
        if (this.peerConnections[peerIndex] && this.peerConnections[peerIndex].opened) {
            this.peerConnections[peerIndex].send(message.type, message.data, message.to, message.from);
        }
        else { // there was no peer connection so we relay it through our servers
            this.connection.send([109 /* PEER_REMOTE_SYSTEM_MESSAGE */, peerIndex, message.type, message.data, message.to, message.from]);
        }
    }
    sendAllPeersMessage(message) {
        this.sendPeersMessage(message, Object.keys(this.peerConnections));
    }
    sendPeersMessage(message, peerIndexes) {
        let peerMessagePayload = [109 /* PEER_REMOTE_SYSTEM_MESSAGE */];
        peerIndexes.forEach(peerIndex => {
            if (this.peerConnections[peerIndex] && this.peerConnections[peerIndex].opened) {
                this.peerConnections[peerIndex].send(message.type, message.data, message.to, message.from);
            }
            else { // there was no peer connection so we relay it through our servers
                peerMessagePayload = [...peerMessagePayload, peerIndex, message.type, message.data, message.to, message.from];
            }
        });
        if (peerMessagePayload.length > 1) {
            if (peerMessagePayload.length > 6) {
                // multiple peers change the protocol for multiple peers
                peerMessagePayload[0] = 110 /* PEERS_REMOTE_SYSTEM_MESSAGE */;
            }
            this.connection.send(peerMessagePayload);
        }
    }
    sendSystemMessage(message) {
        this.connection.send([28 /* SYSTEM_MESSAGE */, message.type, message.data, message.to, message.from]);
    }
    sendImmediateSystemMessage(message) {
        this.connection.send([29 /* IMMEDIATE_SYSTEM_MESSAGE */, message.type, message.data, message.to, message.from]);
    }
    get hasJoined() {
        return this.sessionId !== undefined;
    }
    removeAllListeners() {
        //  super.removeAllListeners();
        this.onJoinConnector.removeAll();
        this.onStateChange.removeAll();
        this.onMessage.removeAll();
        this.onError.removeAll();
        this.onLeave.removeAll();
    }
    onJoin(areaOptions, joinOptions) {
        this.onJoinConnector.dispatch(areaOptions, joinOptions);
        Object.keys(areaOptions).forEach(areaId => {
            this.areas[areaId] = {
                _previousState: {},
                status: AreaStatus.NOT_IN,
                state: new state_listener_1.StateContainer({}),
                options: areaOptions[areaId],
            };
        });
    }
    onMessageCallback(event) {
        const message = msgpack.decode(new Uint8Array(event.data));
        const code = message[0];
        if (code === 10 /* JOIN_CONNECTOR */) {
            // [areaOptions, joinOptions]
            this.onJoin(message[1], message[2]);
        }
        else if (code === 11 /* JOIN_CONNECTOR_ERROR */) {
            this.onError.dispatch(message[1]);
        }
        else if (code === 21 /* SET_CLIENT_AREA_WRITE */) {
            // newAreaId, oldAreaId?, options?
            if (message[2]) {
                this.areas[message[1]].status = AreaStatus.LISTEN;
            }
            this.areas[message[1]].status = AreaStatus.WRITE;
            this.process.dispatchOnAreaWrite(message[1], this.writeAreaId === null, message[2]);
            this.writeAreaId = message[1];
        }
        else if (code === 22 /* ADD_CLIENT_AREA_LISTEN */) {
            // areaId, options?
            this.areas[message[1]].status = AreaStatus.LISTEN;
            const { responseOptions, encodedState } = message[2];
            this.process.dispatchOnAreaListen(message[1], encodedState, responseOptions);
        }
        else if (code === 23 /* REMOVE_CLIENT_AREA_LISTEN */) {
            this.areas[message[1]].status = AreaStatus.NOT_IN;
            this.process.dispatchOnRemoveAreaListen(message[1], message[2]);
        }
        else if (code === 28 /* SYSTEM_MESSAGE */) {
            this.messageQueue.addRemote(message[1], message[2], message[3], message[4]);
        }
        else if (code === 29 /* IMMEDIATE_SYSTEM_MESSAGE */) {
            this.messageQueue.instantDispatch({ type: message[1], data: message[2], to: message[3], from: message[4] }, true);
        }
        else if (code === 27 /* AREA_STATE_UPDATE */) {
            const updateType = message[1];
            const areaId = message[2];
            if (updateType === Protocol_1.StateProtocol.SET) {
                this.setState(message[1], message[2]);
            }
            else if (updateType === Protocol_1.StateProtocol.PATCH) {
                this.patch(message[1], message[2]);
            }
        }
        else if (code === 112 /* SIGNAL_SUCCESS */) {
            // fromPeerIndex, signalData
            console.warn('Connector, GOT SIGNAL SUCCESS FROM PLAYER', message[1], 'the signalData was', message[2]);
            this.startPeerConnection(message[1], message[2]);
        }
        else if (code === 109 /* PEER_REMOTE_SYSTEM_MESSAGE */) { // in case were using a dispatch peer message without a p2p connection itll go through the web server
            // [protocol, fromPeerPlayerIndex, msgType, msgData, msgTo, msgFrom]
            console.warn('from peer was', message[1]);
            console.warn('msg type was', message[2]);
            console.warn('data was', message[3]);
            console.warn('to was', message[4]);
            this.messageQueue.dispatchPeerMessage(message[1], message[2], message[3], message[4], message[5]);
        }
        else if (code === 113 /* SIGNAL_FAILED */) {
            this.stopPeerConnection(message[1]);
        }
    }
    setState(areaId, encodedState) {
        const state = msgpack.decode(encodedState);
        const area = this.areas[areaId];
        area.state.set(state);
        this._previousState = new Uint8Array(encodedState);
        this.onStateChange.dispatch(state);
    }
    patch(areaId, binaryPatch) {
        // apply patch
        const area = this.areas[areaId];
        area._previousState = Buffer.from(fossilDelta.apply(area._previousState, binaryPatch));
        // trigger state callbacks
        area.state.set(msgpack.decode(area._previousState));
        this.onStateChange.dispatch(area.state);
    }
    buildEndPoint(URL, options = {}) {
        const params = [`gottiId=${this.gottiId}`];
        for (const name in options) {
            if (!options.hasOwnProperty(name)) {
                continue;
            }
            params.push(`${name}=${options[name]}`);
        }
        return `ws://${URL}/?${params.join('&')}`;
    }
}
exports.Connector = Connector;
