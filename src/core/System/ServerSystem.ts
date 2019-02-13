import System from "./System";
import { Client as WebClient } from '../WebClient/Client';
import { Message, MessageQueue } from '../MessageQueue';

abstract class ServerSystem extends System {
    readonly name: string | number;

    constructor(name: string | number) {
        super(name);
        this.onRemoteMessage = this.onClientMessage.bind(this);
    }

    public initialize(
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
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchLocal = messageQueue.add;

        //     this.dispatchRemote = room.relayMessageQueue;
        this.initialized = true;

        this._onInit();
    }

    public abstract onAreaMessage(areaId, message);
    public abstract onClientMessage(client, message);

    public dispatchToAreas(message: Message) {};
    public dispatchToClient(clientUid: string, message: Message) {};
    public dispatchToAllClients(message: Message) {};
    public dispatchToLocalClients(message: Message) {}
}

export default ServerSystem;