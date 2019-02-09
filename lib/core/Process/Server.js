"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("./Process");
const ServerGameLoop_1 = require("../ServerGameLoop");
class ServerProcess extends Process_1.Process {
    constructor(room, state, globalSystemVariables) {
        super(Process_1.PROCESS_ENV.SERVER);
        this.gameloop = null;
        if (!(room) || !(state)) {
            throw new Error('Server process needs a GottiServer area room and state to construct correctly');
        }
        this.state = state;
        this.room = room;
        this.room.messageQueue = this.messageQueue;
        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }
    startLoop(fps = 20) {
        let tickRate = 1000 / 20;
        this.gameloop = ServerGameLoop_1.setGameLoop(this.tick.bind(this), tickRate);
    }
    stopLoop() {
        if (this.gameloop != null) {
            ServerGameLoop_1.clearGameLoop(this.gameloop);
        }
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
