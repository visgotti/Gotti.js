"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
class ClientSystem extends System_1.default {
    constructor(name) {
        super(name);
        this.isNetworked = false;
        this.onRemoteMessage = this.onServerMessage.bind(this);
    }
    /**
     * Initialize gets called by the process and
     * populates the system with the web client, message queue, and any
     * user defined variables you want all systems to have access to.
     * The web client
     * @param client - Gotti web client
     * @param messageQueue
     * @param globalSystemVariables - map of objects or values you want to be able to access in any system in the globals property.
     */
    initialize(client, messageQueue, entityManager, isNetworked, globalSystemVariables, gottiId, clientId) {
        this.isNetworked = isNetworked;
        if (globalSystemVariables && typeof globalSystemVariables === 'object') {
            this.globals = globalSystemVariables;
        }
        this.gottiId = gottiId;
        this.clientId = clientId;
        this._peers = client.connector.connectedPeerIndexes;
        this._peerMap = client.connector.peerConnections;
        this.client = client;
        this.messageQueue = messageQueue;
        this.dispatchProcessMessage = client.raiseMessage.bind(client);
        this.initializeEntity = entityManager.initializeEntity.bind(entityManager);
        this.destroyEntity = entityManager.destroyEntity.bind(entityManager);
        this.dispatchToServer = client.sendSystemMessage.bind(client);
        this.immediateDispatchToServer = client.sendImmediateSystemMessage.bind(client);
        this.initialized = true;
        this.dispatchToPeer = client.connector.sendPeerMessage.bind(client.connector);
        this.dispatchToAllPeers = client.connector.sendAllPeersMessage.bind(client.connector);
        this.dispatchToPeers = client.connector.sendPeersMessage.bind(client.connector);
        this._requestPeer = client.connector.requestPeerConnection.bind(client.connector);
        this.removePeer = client.connector.stopPeerConnection.bind(client.connector);
        this._onInit();
    }
    addListenStatePaths(path) {
        if (Array.isArray(path)) {
            path.forEach(p => {
                // confirm its valid path maybe?
                this.client.addSystemPathListener(this, p);
            });
        }
        else {
            this.client.addSystemPathListener(this, path);
        }
    }
    ;
    //TODO: would be cool to do a runtime static code check to make sure onStateUpdate implements all listeners
    onStateUpdate(pathString, pathData, change, value) { }
    ;
    /**
     * triggers onPeerConnectionRequest on peer players computer
     * if the request went through
     * @param peerIndex - playerIndex/clientId
     * @param options - options passed into onPeerConnectionRequest options param for player youre requesting to.
     * @paramm ackTimeout - amount of time in ms you will wait to hear back from the client accepting your request, defaults to 3000
     * @param requestTimeout - amount of time in ms to wait for the accepted request to actually connect, defdults to 5000
     */
    requestPeer(peerIndex, options, ackTimeout, requestTimeout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.onPeerConnectionRequest) {
                throw new Error(`Cannot add a peer from the system ${this.name} it does not implement onPeerConnectionRequest`);
            }
            return new Promise((resolve, reject) => {
                this._requestPeer(peerIndex, this.name, options, (err, options) => {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        options = options ? options : true;
                        return resolve(options);
                    }
                }, ackTimeout, requestTimeout);
            });
        });
    }
    get peers() {
        return this._peers;
    }
    isPeer(playerIndex) {
        return this._peers.indexOf(playerIndex) > -1;
    }
    getPeerPing(playerIndex) {
        const peerConnection = this._peerMap[playerIndex];
        if (peerConnection && peerConnection.connected) {
            return peerConnection.ping;
        }
        return null;
    }
    // overrided in process decoration
    _requestPeer(peerIndex, systemName, options, callback, ackTimeout, requestTimeout) { }
    ;
    dispatchToPeer(toPeerId, message) { }
    ;
    dispatchToPeers(toPeerIds, message) { }
    ;
    dispatchToAllPeers(message) { }
    ;
    removePeer(peerIndex) { }
    ;
}
exports.default = ClientSystem;
