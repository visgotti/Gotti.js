import System from "./System";
import { Component } from "../Component";
import { Message } from '../ClientMessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { EntityManager } from '../EntityManager';
declare abstract class ServerSystem extends System {
    readonly name: string | number;
    messageQueue: ServerMessageQueue;
    areaId: string | number;
    constructor(name: string | number);
    initialize(messageQueue: ServerMessageQueue, entityManager: EntityManager, globalSystemVariables: {
        [reference: string]: any;
    }): void;
    addNetworkedFunctions(component: Component): void;
    abstract onAreaMessage(areaId: any, message: any): any;
    abstract onClientMessage(client: any, message: any): any;
    onMasterMessage?(message: any): any | false;
    dispatchToAreas(message: Message, toAreaIds?: Array<string>): void;
    dispatchToClient(clientUid: string, message: Message): void;
    dispatchToAllClients(message: Message): void;
    dispatchToLocalClients(message: Message): void;
    dispatchToMaster(message: any): void;
}
export default ServerSystem;
