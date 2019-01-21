import { Process, PROCESS_ENV } from './Process';
import { WebClient } from '../WebClient';

export abstract class ClientProcess extends Process<ClientProcess> {
    protected client: WebClient;
    constructor(client: WebClient) {
        super(PROCESS_ENV.CLIENT);
        this.client = client;
        this.systemInitializer = this.initializerFactory(this);
//   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }

    public initialize() {}

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