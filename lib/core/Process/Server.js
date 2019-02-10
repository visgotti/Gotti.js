"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("./Process");
const ServerGameLoop_1 = require("../ServerGameLoop");
class ServerProcess extends Process_1.Process {
    constructor(ClientManagerConstructor, room, globalSystemVariables) {
        super(Process_1.PROCESS_ENV.SERVER);
        this.gameloop = null;
        this.room = room;
        // this.room.messageQueue = this.messageQueue;
        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);
        this.clientManager = this.addSystem(ClientManagerConstructor);
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }
    startLoop(fps = 20) {
        let tickRate = 1000 / fps;
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
