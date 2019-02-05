"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("./Process");
class ServerProcess extends Process_1.Process {
    constructor(room, state, globalSystemVariables) {
        super(Process_1.PROCESS_ENV.SERVER);
        if (!(room) || !(state)) {
            throw new Error('Server process needs a GottiServer area room and state to construct correctly');
        }
        this.state = state;
        this.room = room;
        this.room.messageQueue = this.messageQueue;
        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
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
