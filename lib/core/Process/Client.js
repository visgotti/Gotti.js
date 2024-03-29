"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProcess = void 0;
const Process_1 = require("./Process");
const ClientGameLoop_1 = require("../ClientGameLoop");
class ClientProcess extends Process_1.Process {
    constructor(client, isNetworked, globals, options) {
        super(Process_1.PROCESS_ENV.CLIENT, globals);
        this.fpsTickRate = 60;
        this.isNetworked = false;
        this.peers = [];
        this.isNetworked = isNetworked;
        if (!(client)) {
            throw new Error('Client process needs a web client to construct correctly.');
        }
        if (options && options.fpsTickRate) {
            this.fpsTickRate = options.fpsTickRate;
        }
        this.client = client;
        // add messageQueue to client which is created in the super constructor.
        this.systemInitializer = this.initializerFactory(this);
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }
    setClientIds(gottiId, clientId) {
        this.gottiId = gottiId;
        this.clientId = clientId;
        this.startedSystems.forEach(system => {
            system['gottiId'] = gottiId;
            system['clientId'] = clientId;
        });
    }
    // runs abstract area status update functions if the system implements it
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param isInitial - boolean indicating if this is the first area the client is joining
     * @param options - options sent back from area when accepting the write request.
     */
    dispatchOnAreaWrite(areaId, isInitial, options) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            const system = this.startedSystems[i];
            system.onAreaWrite && system.onAreaWrite(areaId, isInitial, options);
        }
    }
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param state - state of the area you receive upon listening
     * @param options - options sent back from area when it added the client as listener
     */
    dispatchOnAreaListen(areaId, state, options) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            const system = this.startedSystems[i];
            system.onAreaListen && system.onAreaListen(areaId, options);
        }
    }
    /**
     * If a connected peer disconnects we trigger this function and then all of the systems
     * @param peerId
     * @param options
     */
    onPeerDisconnection(peerId, options) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            const system = this.startedSystems[i];
            system.onPeerDisconnection && system.onPeerDisconnection(peerId, options);
        }
    }
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param options - options sent back from area when the client was removed.
     */
    dispatchOnRemoveAreaListen(areaId, options) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            const system = this.startedSystems[i];
            system.onRemoveAreaListen && system.onRemoveAreaListen(areaId, options);
        }
    }
    /**
     * when we receive a peer connection request if the system doesnt have a onPeerConnectionRequested handler
     * we automatically return false and fail the peer connection
     * @param peerId
     * @param systemName
     * @param options
     */
    onPeerConnectionRequest(peerId, systemName, options) {
        const system = this.systems[systemName];
        if (this.startedSystems.indexOf(system) > -1 && system.onPeerConnectionRequest) {
            return system.onPeerConnectionRequest(peerId, options);
        }
        return false;
    }
    /**
     * When a peer connection is accepted and the peers are connected
     * @param peerId
     * @param options
     */
    onPeerConnection(peerIndex, options) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            const system = this.startedSystems[i];
            system.onPeerConnection && system.onPeerConnection(peerIndex, options);
        }
    }
    onPeerMissedPing(peerIndex, missedPings) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            const system = this.startedSystems[i];
            system.onPeerMissedPing && system.onPeerMissedPing(peerIndex, missedPings);
        }
    }
    startLoop(fps = this.fpsTickRate) {
        ClientGameLoop_1.setGameLoop(this.tick.bind(this), 1000 / fps);
    }
    stopLoop() {
        this.clear();
        ClientGameLoop_1.clearGameLoop();
    }
    clearGame() {
        this.clear();
        ClientGameLoop_1.clearGameLoop();
    }
    startSystem(system) {
        this._startSystem(system);
    }
    startAllSystems() {
        this._startAllSystems();
    }
    restartSystem(system) {
        this._restartSystem(system);
    }
    stopSystem(system) {
        this._stopSystem(system);
    }
    stopAllSystems() {
        this._stopAllSystems();
    }
}
exports.ClientProcess = ClientProcess;
