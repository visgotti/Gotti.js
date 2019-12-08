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
        this.onInitialArea = new signals_1.Signal();
        this.areas = {};
        this.peerConnections = {};
        // adds the system name that requested the peer connection so we call the correct handlers inside the system when we receive a response
        this.pendingPeerRequests = {};
        this.peerAckRequestTimeouts = {};
        this.peerConnectedRequestTimeouts = {};
        this.connectedPeerIndexes = [];
    }
    connect(connectorAuth, process, processManager, areaData, options = {}, webSocketProtocol) {
        return __awaiter(this, void 0, void 0, function* () {
            const { gottiId, playerIndex, connectorURL } = connectorAuth;
            this.gottiId = gottiId;
            this.areaData = areaData;
            this.playerIndex = playerIndex;
            this.processManager = processManager;
            this.process = process;
            this.messageQueue = process.messageQueue;
            let url = this.buildEndPoint(connectorURL, options, webSocketProtocol);
            this.connection = new Connection_1.Connection(url);
            this.connection.onopen = () => { };
            this.connection.onmessage = this.onMessageCallback.bind(this);
            return new Promise((resolve, reject) => {
                this.onJoinConnector.add(joinOptions => {
                    return resolve(joinOptions);
                });
            });
        });
    }
    handlePeerConnectionRequest(peerIndex, signalData, systemName, incomingRequestOptions) {
        if (!(this.peerConnections[peerIndex])) {
            // this check may be redundant
            if (!this.pendingPeerRequests[peerIndex]) {
                const response = this.process.onPeerConnectionRequest(peerIndex, systemName, incomingRequestOptions);
                if (!response) { // our system requester invalidated the connection.
                    this.connection.send([113 /* SIGNAL_FAILED */, peerIndex]);
                    return;
                }
                this.peerConnections[peerIndex] = new PeerConnection_1.PeerConnection(this.connection, this.playerIndex, peerIndex);
                this.setupPeerConnection(this.peerConnections[peerIndex], peerIndex);
                this.peerConnections[peerIndex].acceptConnection(response);
            }
            else {
                throw new Error('handle peer connection request error');
            }
        }
        this.handleSignalData(peerIndex, signalData);
    }
    handleSignalData(peerIndex, signalData) {
        const peerConnection = this.peerConnections[peerIndex];
        if (!peerConnection) {
            console.error('Attempting to handle signal data for non existent peer:', peerIndex);
            return;
        }
        if (signalData.sdp) {
            peerConnection.handleSDPSignal(signalData.sdp);
        }
        else if (signalData.candidate) {
            peerConnection.handleIceCandidateSignal(signalData.candidate);
        }
    }
    requestPeerConnection(peerIndex, systemName, requestOptions, systemRequestCallback, connectionTimeout = 3000) {
        let peerConnection = this.peerConnections[peerIndex];
        if (!(peerConnection)) {
            peerConnection = new PeerConnection_1.PeerConnection(this.connection, this.playerIndex, peerIndex);
            this.setupPeerConnection(peerConnection, peerIndex);
            peerConnection.requestConnection(systemName, requestOptions);
            this.peerConnections[peerIndex] = peerConnection;
            this.pendingPeerRequests[peerIndex] = systemRequestCallback;
            this.peerAckRequestTimeouts[peerIndex] = setTimeout(() => {
                peerConnection.onAck.removeAll();
                delete this.peerAckRequestTimeouts[peerIndex];
                this.handlePeerFailure(peerIndex, null, 'Peer connection timed out, never received an acknowledgement back from peer.');
            }, 2000);
            // add the ack callback to remove the timeout
            peerConnection.onAck.addOnce(() => {
                clearTimeout(this.peerAckRequestTimeouts[peerIndex]);
                delete this.peerAckRequestTimeouts[peerIndex];
                // we got the ack, now we want to add a callback for the actual request unless for some reason the
                // peer connection was already connected
                if (!peerConnection.connected) {
                    this.peerConnectedRequestTimeouts[peerIndex] = setTimeout(() => {
                        delete this.peerConnectedRequestTimeouts[peerIndex];
                        this.handlePeerFailure(peerIndex, null, 'Peer connection timed out on actual handshake of webRTC connection');
                    }, connectionTimeout);
                }
            });
        }
        else {
            throw new Error(`Already existing peer connection for peer:, ${peerIndex}`);
        }
    }
    stopAllPeerConnections() {
        for (let peerIndex in this.peerConnections) {
            this.peerConnections[peerIndex].destroy();
        }
    }
    stopPeerConnection(peerIndex) {
        if (this.peerConnections[peerIndex]) {
            this.peerConnections[peerIndex].destroy();
        }
    }
    joinInitialArea(options) {
        if (!this.connection) {
            throw new Error('No connection, can not join an initial area');
        }
        if (this.writeAreaId !== null) {
            throw new Error('Player is already writing to an area.');
        }
        console.log('GET INITIAL CLIENT AREA WRITE');
        this.connection.send([20 /* GET_INITIAL_CLIENT_AREA_WRITE */, options]);
    }
    disconnect() {
        this.removeAllListeners();
        this.stopAllPeerConnections();
        this.connection.close();
        this.process = null;
        this.messageQueue = null;
    }
    sendPeerMessage(peerIndex, message) {
        this.peerConnections[peerIndex].send(msgpack.encode(message.type, message.data, message.to, message.from));
    }
    sendAllPeersMessage(message) {
        const len = this.connectedPeerIndexes.length;
        const encoded = msgpack.encode([message.type, message.data, message.to, message.from]);
        for (let i = 0; i < len; i++) {
            this.peerConnections[this.connectedPeerIndexes[i]].send(encoded);
        }
    }
    sendPeersMessage(peerIndexes, message) {
        let len = peerIndexes.length;
        const encoded = msgpack.encode([message.type, message.data, message.to, message.from]);
        for (let i = 0; i < len; i++) {
            this.peerConnections[peerIndexes[i]].send(encoded);
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
        this.onJoinConnector.removeAll();
        this.onStateChange.removeAll();
        this.onMessage.removeAll();
        this.onError.removeAll();
        this.onLeave.removeAll();
    }
    onJoin(joinOptions) {
        Object.keys(this.areaData).forEach(areaId => {
            const { data, type } = this.areaData[areaId];
            this.areas[areaId] = {
                _previousState: {},
                status: AreaStatus.NOT_IN,
                state: new state_listener_1.StateContainer({}),
                options: {},
                data,
                type,
            };
        });
        this.onJoinConnector.dispatch(joinOptions);
    }
    onMessageCallback(event) {
        const message = msgpack.decode(new Uint8Array(event.data));
        const code = message[0];
        if (code === 10 /* JOIN_CONNECTOR */) {
            // [joinOptions]
            this.onJoin(message[1]);
        }
        else if (code === 11 /* JOIN_CONNECTOR_ERROR */) {
            this.onError.dispatch(message[1]);
        }
        else if (code === 21 /* SET_CLIENT_AREA_WRITE */) {
            // newAreaId, options?
            if (this.writeAreaId) {
                this.areas[this.writeAreaId].status = AreaStatus.LISTEN;
            }
            this.areas[message[1]].status = AreaStatus.WRITE;
            const isInitial = this.writeAreaId === null;
            this.writeAreaId = message[1];
            // if we werent already listening then start the area systems
            if (!(this.areas[message[1]].status === AreaStatus.LISTEN)) {
                this.processManager.startAreaSystems(message[1]);
            }
            if (isInitial) {
                this.onInitialArea.dispatch({ areaId: message[1], areaOptions: message[2] });
            }
        }
        else if (code === 22 /* ADD_CLIENT_AREA_LISTEN */) {
            // areaId, options?
            this.areas[message[1]].status = AreaStatus.LISTEN;
            this.processManager.startAreaSystems(message[1]);
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
        else if (code === 114 /* PEER_CONNECTION_REQUEST */) {
            // peerIndex, signalData, systemName, incomingRequestOptions?
            this.handlePeerConnectionRequest(message[1], message[2], message[3], message[4]);
        }
        else if (code === 112 /* SIGNAL_SUCCESS */) {
            // fromPeerIndex, signalData
            console.warn('Connector, GOT SIGNAL SUCCESS FROM PLAYER', message[1], 'the signalData was', message[2]);
            this.handleSignalData(message[1], message[2]);
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
            this.handlePeerFailure(message[1]);
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
    buildEndPoint(URL, options = {}, protocol) {
        if (protocol !== 'ws:' && protocol !== 'wss:') {
        }
        else if (protocol === 'ws' || protocol === 'wss') {
            protocol = protocol + ':';
        }
        else {
            throw new Error('websocket protocol must be ws or wss');
        }
        const params = [`gottiId=${this.gottiId}`];
        for (const name in options) {
            if (!options.hasOwnProperty(name)) {
                continue;
            }
            params.push(`${name}=${options[name]}`);
        }
        return `${protocol}//${URL}/?${params.join('&')}`;
    }
    handlePeerFailure(peerIndex, options, err) {
        const peerConnection = this.peerConnections[peerIndex];
        if (!peerConnection) {
            console.error(`Peer failure for peerIndex ${peerIndex} did not have a correlated peer connection.`);
        }
        else {
            peerConnection.onConnected.removeAll();
        }
        // check to see if we have a pending request so we can initiate the callback
        if (this.pendingPeerRequests[peerIndex]) {
            err = err ? err : true;
            this.pendingPeerRequests[peerIndex](err, null);
            delete this.pendingPeerRequests[peerIndex];
        }
        if (this.peerAckRequestTimeouts[peerIndex]) {
            clearTimeout(this.peerAckRequestTimeouts[peerIndex]);
            delete this.peerAckRequestTimeouts[peerIndex];
        }
        if (this.peerConnectedRequestTimeouts[peerIndex]) {
            clearTimeout(this.peerConnectedRequestTimeouts[peerIndex]);
            delete this.peerConnectedRequestTimeouts[peerIndex];
        }
        const index = this.connectedPeerIndexes.indexOf(peerIndex);
        if (index > -1) {
            this.connectedPeerIndexes.splice(index, 1);
            if (this.process) {
                this.process.peers = this.connectedPeerIndexes;
                this.process.onPeerDisconnection(peerIndex, options);
            }
        }
        delete this.peerConnections[peerIndex];
        peerConnection.destroy();
    }
    setupPeerConnection(peerConnection, peerIndex) {
        peerConnection.onConnected.add((options) => {
            if (!this.connectedPeerIndexes.includes(peerIndex)) {
                if (this.pendingPeerRequests[peerIndex]) {
                    this.pendingPeerRequests[peerIndex](null, options);
                }
                // check ack for good measure ;]
                if (this.peerAckRequestTimeouts[peerIndex]) {
                    clearTimeout(this.peerAckRequestTimeouts[peerIndex]);
                    delete this.peerAckRequestTimeouts[peerIndex];
                }
                // this should still be defined..
                if (this.peerConnectedRequestTimeouts[peerIndex]) {
                    clearTimeout(this.peerConnectedRequestTimeouts[peerIndex]);
                    delete this.peerConnectedRequestTimeouts[peerIndex];
                }
                this.connectedPeerIndexes.push(peerIndex);
                this.process.peers = this.connectedPeerIndexes;
                this.process.onPeerConnection(peerIndex, options);
            }
        });
        peerConnection.onDisconnected.add((errorOptions) => {
            this.handlePeerFailure(peerIndex, errorOptions);
        });
        peerConnection.onMessage.add((data) => {
            this.messageQueue.dispatchPeerMessage(peerIndex, data[0], data[1], data[2], data[3]);
        });
        peerConnection.onMissedPing.add((concurrentMissedPings) => {
            this.process.onPeerMissedPing(peerIndex, concurrentMissedPings);
        });
    }
}
exports.Connector = Connector;
