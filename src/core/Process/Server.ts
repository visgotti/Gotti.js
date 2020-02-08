import { Process, PROCESS_ENV } from './Process';

import { setGameLoop, clearGameLoop } from '../ServerGameLoop';

import { ClientManager } from '../ServerFrameworks/ClientManager';

import { ISystem } from './Process';

import ServerSystem from '../System/ServerSystem';

import { ServerMessageQueue } from '../Server/ServerMessageQueue';

interface ServerProcessOptions {
    fpsTickRate?: number,
}

export class ServerProcess extends Process<ServerProcess> {
    private gameloop: any = null;
    private room: any = null;
    public clientManager: ClientManager;
    private fpsTickRate: number = 20;
    public messageQueue: ServerMessageQueue;

    constructor(ClientManagerConstructor: ISystem, globals?: any, options?: ServerProcessOptions) {
        super(PROCESS_ENV.SERVER, globals);

        if(options && options.fpsTickRate) {
            this.fpsTickRate = options.fpsTickRate;
        }

        this.systemInitializer = this.initializerFactory(this);

        this.clientManager = this.addSystem(ClientManagerConstructor) as ClientManager;

        let oldAddSystem = this.addSystem.bind(this);

        // override addSystem with additional check for room with network functions.
        this.addSystem = (SystemConstructor: ISystem, ...args: Array<any>) => {
            // call old
            let system = oldAddSystem(SystemConstructor, ...args) as ServerSystem;
            // if we already added the room reference and then add a system then we want to bind
            // the network functions to it.
            if(this.room) {
                this.decorateSystemWithRoomFunctions(system, this.room);
            }
            if(this.clientManager) {
                this.decorateSystemWithClientManagerFunctions(system, this.clientManager)
            }
            return system;
        };
    }

    // call trace until I refactor this ----- Area Server Constructor > calls AreaRoom.initializeAndStart > calls AreaRoom.startGottiProcess
    public addRoom(room) {
        this.room = room;
        for(let name in this.systems) {
            const system = this.systems[name] as ServerSystem;
            this.decorateSystemWithRoomFunctions(system, room);
            if(this.clientManager) {
                this.decorateSystemWithClientManagerFunctions(system, this.clientManager);
            }
        }
    }

    private decorateSystemWithClientManagerFunctions(system: ServerSystem, clientManager: ClientManager) {
        system.setClientWrite = this.clientManager.setClientWrite.bind(clientManager);
        system.removeClientListener = this.clientManager.removeClientListener.bind(clientManager);
        system.addClientListener = this.clientManager.addClientListener.bind(clientManager);
    }

    private decorateSystemWithRoomFunctions(system: ServerSystem, room: any) {
        system.dispatchToAllClients = room.dispatchToAllClients.bind(room);
        system.dispatchToLocalClients = room.dispatchToLocalClients.bind(room);
        system.dispatchToClient = room.dispatchToClient.bind(room);
        system.dispatchToAreas = room.dispatchToAreas.bind(room);
        system.dispatchToMaster = room.dispatchToMaster.bind(room);
        system.areaId = room.areaId;
    }

    public startLoop(fps = this.fpsTickRate) {
        let tickRate = 1000 / fps;
        this.gameloop = setGameLoop(this.tick.bind(this), tickRate);
    }

    public stopLoop() {
        if(this.gameloop != null) {
            clearGameLoop(this.gameloop);
        }
    }

    public startSystem(systemName) {
        this._startSystem(systemName);
    };

    public startAllSystems() {
        this._startAllSystems();
    }

    public stopSystem(systemName) {
        this._stopSystem(systemName);
    };

    public stopAllSystems() {
        this._stopAllSystems();
    }
}