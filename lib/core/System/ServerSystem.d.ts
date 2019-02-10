import System from "./System";
import { Message, MessageQueue } from '../MessageQueue';
declare abstract class ServerSystem extends System {
    readonly name: string | number;
    room: any;
    constructor(name: string | number);
    initialize(room: any, messageQueue: MessageQueue, globalSystemVariables: {
        [reference: string]: any;
    }): void;
    abstract onAreaMessage(areaId: any, message: any): any;
    abstract onClientMessage(client: any, message: any): any;
    protected dispatchToAreas(message: Message): void;
    protected dispatchToClient(clientUid: string, message: MessageQueue): void;
    protected dispatchToAllClients(message: any): void;
    protected dispatchToLocalClients(message: any): void;
}
export default ServerSystem;
