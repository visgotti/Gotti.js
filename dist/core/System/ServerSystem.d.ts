import System from "./System";
import { Message, MessageQueue } from '../MessageQueue';
declare abstract class ServerSystem extends System {
    readonly name: string;
    room: any;
    state: any;
    constructor(name: string);
    initialize(room: any, state: any, messageQueue: MessageQueue, globalSystemVariables: {
        [reference: string]: any;
    }): void;
    abstract onAreaMessage(areaId: any, message: any): any;
    abstract onClientMessage(message: any): any;
    protected dispatchToArea(areaId: string, message: Message): void;
    protected dispatchAllAreas(message: Message): void;
    protected dispatchToClient(clientUid: string, message: MessageQueue): void;
    protected dispatchToAllClients(message: any): void;
    abstract onServerMessage(message: Message): any;
}
export default ServerSystem;
