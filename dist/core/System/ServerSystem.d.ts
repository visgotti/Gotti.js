import System from "./System";
import { Message, MessageQueue } from '../MessageQueue';
declare abstract class ServerSystem extends System {
    readonly name: string;
    private interfaceManager?;
    private room;
    private dispatchToServer;
    constructor(name: string);
    initialize(entityMap: any, gameState: any, messageQueue: MessageQueue, room: any, interfaceManager: any): void;
    abstract onAreaMessage(areaId: any, message: any): any;
    abstract onClientMessage(clientUid: any, message: any): any;
    protected dispatchToArea(areaId: string, message: Message): void;
    protected dispatchAllAreas(message: Message): void;
    protected dispatchToClient(clientUid: string, message: MessageQueue): void;
    protected dispatchToAllClients(message: any): void;
    abstract onServerMessage(message: Message): any;
}
export default ServerSystem;
