"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("./Process");
const ClientGameLoop_1 = require("../ClientGameLoop");
class ClientProcess extends Process_1.Process {
    constructor(client, globalSystemVariables) {
        super(Process_1.PROCESS_ENV.CLIENT);
        if (!(client)) {
            throw new Error('Client process needs a web client to construct correctly.');
        }
        client.addProcess(this);
        this.client = client;
        // add messageQueue to client which is created in the super constructor.
        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }
    // runs abstract area status update functions if the system implements it
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param isInitial - boolean indicating if this is the first area the client is joining
     * @param options - options sent back from area when accepting the write request.
     */
    dispatchOnAreaWrite(areaId, isInitial, options) {
        const length = this.systemNames.length;
        for (let i = 0; i < length; i++) {
            const system = this.systems[this.systemNames[i]];
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
        console.log('dispatching on listen', areaId, state, options);
        const length = this.systemNames.length;
        for (let i = 0; i < length; i++) {
            const system = this.systems[this.systemNames[i]];
            system.onAreaListen && system.onAreaListen(areaId, options);
        }
    }
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param options - options sent back from area when the client was removed.
     */
    dispatchOnRemoveAreaListen(areaId, options) {
        const length = this.systemNames.length;
        for (let i = 0; i < length; i++) {
            const system = this.systems[this.systemNames[i]];
            system.onRemoveAreaListen && system.onRemoveAreaListen(areaId, options);
        }
    }
    startLoop(fps = 60) {
        ClientGameLoop_1.setGameLoop(this.tick.bind(this), 1000 / fps);
    }
    stopLoop() {
        ClientGameLoop_1.clearGameLoop();
    }
    startSystem(systemName) {
        this._startSystem(systemName);
    }
    startAllSystems() {
        this._startAllSystems();
    }
    stopSystem(systemName) {
        this._stopSystem(systemName);
    }
    stopAllSystems() {
        this._stopAllSystems();
    }
}
exports.ClientProcess = ClientProcess;
