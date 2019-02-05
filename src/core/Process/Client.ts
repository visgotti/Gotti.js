import { Process, PROCESS_ENV } from './Process';
import { ClientSystem } from '../System/ClientSystem';
import { WebClient } from '../WebClient/Client';

export class ClientProcess extends Process<ClientProcess> {
    protected client: WebClient;
    constructor(client: WebClient, globalSystemVariables) {
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