import { Process, PROCESS_ENV } from '../Process';


export class ClientProcess extends Process {
    private room: any;
    constructor(room) {
        super(PROCESS_ENV.CLIENT);
        this.room = room;

        this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))

    }
    initializeSystems() {
    }
}