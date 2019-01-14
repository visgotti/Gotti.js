import { Process, PROCESS_ENV } from './Process';


export class Client extends Process<Client> {
    private room: any;
    constructor(room) {
        super(PROCESS_ENV.CLIENT);
        this.room = room;
//   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))

    }
    public initialize() {
       // this.initializeSystem();
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