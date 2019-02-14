import System from "./System";
import { Message } from '../MessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
declare abstract class ServerSystem extends System {
    readonly name: string | number;
    messageQueue: ServerMessageQueue;
    constructor(name: string | number);
    initialize(messageQueue: ServerMessageQueue, globalSystemVariables: {
        [reference: string]: any;
    }): void;
    abstract onAreaMessage(areaId: any, message: any): any;
    abstract onClientMessage(client: any, message: any): any;
    dispatchToAreas(message: Message): void;
    dispatchToClient(clientUid: string, message: Message): void;
    dispatchToAllClients(message: Message): void;
    dispatchToLocalClients(message: Message): void;
}
export default ServerSystem;
