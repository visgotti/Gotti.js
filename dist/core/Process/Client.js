"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("./Process");
class ClientProcess extends Process_1.Process {
    constructor(client) {
        super(Process_1.PROCESS_ENV.CLIENT);
        this.client = client;
        this.systemInitializer = this.initializerFactory(this);
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }
    initialize() { }
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
