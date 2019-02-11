import { Process, PROCESS_ENV } from './Process';

import { setGameLoop, clearGameLoop } from '../ServerGameLoop';

import { ClientManager } from '../ServerFrameworks/ClientManager';

import { ISystem } from './Process';

import ServerSystem from '../System/ServerSystem';

export class ServerProcess extends Process<ServerProcess> {
    private gameloop: any = null;
    private room: any = null;
    public clientManager: ClientManager;

    constructor(ClientManagerConstructor: ISystem, globalSystemVariables?: any) {
        super(PROCESS_ENV.SERVER);

        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);

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
            return system;
        };
    }

    // call trace until I refactor this ----- Area Server Constructor > calls AreaRoom.initializeAndStart > calls AreaRoom.startGottiProcess
    public addRoom(room) {
        this.room = room;
        for(let name in this.systems) {
            const system = this.systems[name] as ServerSystem;
            this.decorateSystemWithRoomFunctions(system, room);
        }
    }

    private decorateSystemWithRoomFunctions(system: ServerSystem, room: any) {
        system.dispatchToAllClients = room.dispatchToAllClients.bind(room);
        system.dispatchToLocalClients = room.dispatchToLocalClients.bind(room);
        system.dispatchToClient = room.dispatchToClient.bind(room);
        system.dispatchToAreas = room.dispatchToAreas.bind(room);
    }

    public startLoop(fps = 20) {
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