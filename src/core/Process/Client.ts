import { Process, PROCESS_ENV } from './Process';
import { Client as WebClient } from '../WebClient/Client';
import { setGameLoop, clearGameLoop } from '../ClientGameLoop';

export class ClientProcess extends Process<ClientProcess> {
    public client: WebClient;
    constructor(client: WebClient, globalSystemVariables?: any) {
        super(PROCESS_ENV.CLIENT);

        if(!(client)) {
            throw new Error('Client process needs a web client to construct correctly.')
        }

        this.client = client;
        // add messageQueue to client which is created in the super constructor.
        this.client.messageQueue = this.messageQueue;
        this.systemInitializer = this.initializerFactory(this, globalSystemVariables);
//   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }

    public startLoop(fps = 60) {
        setGameLoop(this.tick.bind(this), fps);
    }

    public stopLoop() {
        clearGameLoop();
    }

    public startSystem(systemName) {
        this._startSystem(systemName);
    }

    public startAllSystems() {
        this._startAllSystems();
    }

    public stopSystem(systemName) {
        this._stopSystem(systemName);
    }

    public stopAllSystems() {
        this._stopAllSystems();
    }
}