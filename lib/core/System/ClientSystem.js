"use strict";
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
    initialize(client, messageQueue, entityManager, isNetworked, globalSystemVariables) {
        this.isNetworked = isNetworked;
        if (globalSystemVariables && typeof globalSystemVariables === 'object') {
            this.globals = globalSystemVariables;
        }
        this.client = client;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchProcessMessage = client.raiseMessage.bind(client);
        this.initializeEntity = entityManager.initializeEntity.bind(entityManager);
        this.destroyEntity = entityManager.destroyEntity.bind(entityManager);
        this.dispatchToServer = client.sendSystemMessage.bind(client);
        this.immediateDispatchToServer = client.sendImmediateSystemMessage.bind(client);
        this.initialized = true;
        this.dispatchToPeer = client.connector.sendPeerMessage.bind(client.connector);
        this.dispatchToAllPeers = client.connector.sendAllPeersMessage.bind(client.connector);
        this.dispatchToPeers = client.connector.sendPeersMessage.bind(client.connector);
        this.addPeer = client.connector.startPeerConnection.bind(client.connector);
        this.removePeer = client.connector.stopPeerConnection.bind(client.connector);
        this.getPeers = () => {
            return Object.keys(client.connector.peerConnections);
        };
        this._onInit();
    }
    addNetworkedFunctions(component) {
        if (this.isNetworked) { // make sure client system is networked before binding
            component.sendRemote = this.dispatchToServer.bind(this);
            component.sendRemoteImmediate = this.immediateDispatchToServer.bind(this);
            //client side components dont broadcast so just execute empty func if called
            component.broadcastRemote = (message) => { };
        }
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
    // overrided
    dispatchToPeer(toPeerId, message) { }
    ;
    dispatchToPeers(toPeerIds, message) { }
    ;
    dispatchToAllPeers(message) { }
    ;
    addPeer(peerIndex) { }
    ;
    removePeer(peerIndex) { }
    ;
    getPeers() { return []; }
    ;
}
exports.default = ClientSystem;
