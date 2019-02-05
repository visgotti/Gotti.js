"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("./Process");
class ClientProcess extends Process_1.Process {
    constructor(client, globalSystemVariables) {
        super(Process_1.PROCESS_ENV.CLIENT);
        if (!(client)) {
            throw new Error('Client process needs a web client to construct correctly.');
        }
        this.client = client;
        // add messageQueue to client which is created in the super constructor.
        this.client.messageQueue = this.messageQueue;
        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
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
