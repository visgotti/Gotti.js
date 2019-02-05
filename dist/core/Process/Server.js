"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("./Process");
class ServerProcess extends Process_1.Process {
    constructor(room) {
        super(Process_1.PROCESS_ENV.SERVER);
        this.room = room;
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }
    initialize() {
        // this.initializeSystem();
    }
    startSystem(systemName) {
        this._startSystem(systemName);
    }
    ;
    startAllSystems() {
        this._startAllSystems();
    }
    stopSystem(systemName) {
        this._stopSystem(systemName);
    }
    ;
    stopAllSystems() {
        this._stopAllSystems();
    }
}
exports.ServerProcess = ServerProcess;
