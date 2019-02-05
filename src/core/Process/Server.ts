import { Process, PROCESS_ENV } from './Process';


export class ServerProcess extends Process<ServerProcess> {
    private room: any;
    private state: any;

    constructor(room, state, globalSystemVariables) {
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