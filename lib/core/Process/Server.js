"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("./Process");
const ServerGameLoop_1 = require("../ServerGameLoop");
class ServerProcess extends Process_1.Process {
    constructor(ClientManagerConstructor, globals, options) {
        super(Process_1.PROCESS_ENV.SERVER, globals);
        this.gameloop = null;
        this.room = null;
        this.fpsTickRate = 20;
        if (options && options.fpsTickRate) {
            this.fpsTickRate = options.fpsTickRate;
        }
        this.systemInitializer = this.initializerFactory(this);
        this.clientManager = this.addSystem(ClientManagerConstructor);
        let oldAddSystem = this.addSystem.bind(this);
        // override addSystem with additional check for room with network functions.
        this.addSystem = (SystemConstructor, ...args) => {
            // call old
            let system = oldAddSystem(SystemConstructor, ...args);
            // if we already added the room reference and then add a system then we want to bind
            // the network functions to it.
            if (this.room) {
                this.decorateSystemWithRoomFunctions(system, this.room);
            }
            if (this.clientManager) {
                this.decorateSystemWithClientManagerFunctions(system, this.clientManager);
            }
            return system;
        };
    }
    // call trace until I refactor this ----- Area Server Constructor > calls AreaRoom.initializeAndStart > calls AreaRoom.startGottiProcess
    addRoom(room) {
        this.room = room;
        for (let name in this.systems) {
            const system = this.systems[name];
            this.decorateSystemWithRoomFunctions(system, room);
            if (this.clientManager) {
                this.decorateSystemWithClientManagerFunctions(system, this.clientManager);
            }
        }
    }
    decorateSystemWithClientManagerFunctions(system, clientManager) {
        system.setClientWrite = this.clientManager.setClientWrite.bind(clientManager);
        system.removeClientListener = this.clientManager.removeClientListener.bind(clientManager);
        system.addClientListener = this.clientManager.addClientListener.bind(clientManager);
    }
    decorateSystemWithRoomFunctions(system, room) {
        system.dispatchToAllClients = room.dispatchToAllClients.bind(room);
        system.dispatchToLocalClients = room.dispatchToLocalClients.bind(room);
        system.dispatchToClient = room.dispatchToClient.bind(room);
        system.dispatchToAreas = room.dispatchToAreas.bind(room);
        system.dispatchToMaster = room.dispatchToMaster.bind(room);
        system.areaId = room.areaId;
    }
    startLoop(fps = this.fpsTickRate) {
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
