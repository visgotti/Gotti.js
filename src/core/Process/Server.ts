import { Process, PROCESS_ENV } from './Process';

import { setGameLoop, clearGameLoop } from '../ServerGameLoop';

import { ClientManager } from '../ServerFrameworks/ClientManager';

import { ISystem } from './Process';

export class ServerProcess extends Process<ServerProcess> {
    private gameloop: any = null;

    public clientManager: ClientManager;

    constructor(room: any, ClientManagerConstructor: ISystem, globalSystemVariables?: any) {
        super(PROCESS_ENV.SERVER);

        this.systemInitializer = this.initializerFactory(this, room, globalSystemVariables);

        this.clientManager = this.addSystem(ClientManagerConstructor) as ClientManager;
    }

    public decorateSystemsWithNetworkFunctions(room) {
        for(let i = 0; i < this.systems.length; i++) {
            this.systems[i].dispatchToAllClients = room.dispatchGlobalSystemMessage.bind(room);
            this.systems[i].dispatchToLocalClients = room.dispatchLocalSystemMessage.bind(room);
            this.systems[i].dispatchToClient = room.dispatchClientSystemMessage.bind(room);
            this.systems[i].dispatchToAreas = room.dispatchSystemMessageToAreas.bind(room);
        }
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