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
        this.client = client;
        // add messageQueue to client which is created in the super constructor.
        this.client.messageQueue = this.messageQueue;
        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);
        //   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
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
