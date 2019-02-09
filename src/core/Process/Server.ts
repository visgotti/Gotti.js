import { Process, PROCESS_ENV } from './Process';

import * as gameloop from 'node-gameloop';

export class ServerProcess extends Process<ServerProcess> {
    public room: any;
    public state: any;

    private gameloop: any = null;

    constructor(room, state, globalSystemVariables?: any) {
        super(PROCESS_ENV.SERVER);

        if(!(room) || !(state)) {
            throw new Error('Server process needs a GottiServer area room and state to construct correctly');
        }


        this.state = state;
        this.room = room;
        this.room.messageQueue = this.messageQueue;

        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);

//   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }

    public startLoop(fps = 20) {
        let tickRate = 1000 / 20;
        this.gameloop = gameloop.setGameLoop(this.tick.bind(this), tickRate);
    }

    public stopLoop() {
        if(this.gameLoop != null) {
            gameloop.clearGameLoop(this.gameloop);
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