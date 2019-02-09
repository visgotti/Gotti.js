import System from "./System";
import { Client as WebClient } from '../WebClient/Client';
import { Message, MessageQueue } from '../MessageQueue';

abstract class ServerSystem extends System {
    readonly name: string | number;
    public room: any;
    public state: any;

    constructor(name: string | number) {
        super(name);
        this.onRemoteMessage = this.onClientMessage.bind(this);
    }

    public initialize(
        room: any,
        state: any,
        messageQueue: MessageQueue,
        globalSystemVariables: {[reference: string]: any})
    {
        if(globalSystemVariables && typeof globalSystemVariables === 'object') {
            Object.keys(globalSystemVariables).forEach((referenceName) => {
                if(referenceName in this.globals) {
                    throw new Error(`Duplicate global object references: ${referenceName}`);
                }
                this.globals[referenceName] = globalSystemVariables[referenceName];
            });
        }

        //  this.dispatchToClient = room.send;
        this.state = state;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchLocal = messageQueue.add;

        //     this.dispatchRemote = room.relayMessageQueue;
        this.initialized = true;

        this._onInit();
    }

    public abstract onAreaMessage(areaId, message);
    public abstract onClientMessage(client, message);

    protected dispatchToArea(areaId: string, message: Message) {};
    protected dispatchAllAreas(message: Message) {};
    protected dispatchToClient(clientUid: string, message: MessageQueue) {};
    protected dispatchToAllClients(message) {};
}

export default ServerSystem;