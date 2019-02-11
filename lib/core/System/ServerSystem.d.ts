import System from "./System";
import { Message, MessageQueue } from '../MessageQueue';
declare abstract class ServerSystem extends System {
    readonly name: string | number;
    constructor(name: string | number);
    initialize(messageQueue: MessageQueue, globalSystemVariables: {
        [reference: string]: any;
    }): void;
    abstract onAreaMessage(areaId: any, message: any): any;
    abstract onClientMessage(client: any, message: any): any;
    dispatchToAreas(message: Message): void;
    dispatchToClient(clientUid: string, message: MessageQueue): void;
    dispatchToAllClients(message: any): void;
    dispatchToLocalClients(message: any): void;
}
export default ServerSystem;
