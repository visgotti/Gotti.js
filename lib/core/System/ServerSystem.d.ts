import System from "./System";
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
    abstract onAreaMessage(areaId: any, message: any): any;
    abstract onClientMessage(client: any, message: any): any;
    onMasterMessage?(message: any): any | false;
    dispatchToAreas(message: Message, toAreaIds?: Array<string>): void;
    dispatchToClient(clientUid: string, message: Message): void;
    dispatchToAllClients(message: Message): void;
    dispatchToLocalClients(message: Message): void;
    dispatchToMaster(message: any): void;
    /**
     * Sets a client to write to a specific area.
     * @param clientId - id of client to set
     * @param areaId - id of area the client will be writing to
     * @param options - options that get sent to the new area's ClientManager's onClientWrite
     */
    setClientWrite(clientId: any, areaId: any, options?: any): void;
    /**
     * Adds an area to the client to listen to.
     * @param clientId - client to add listener to
     * @param areaId - id of area that the client is listening to
     * @param options - options that get sent to the new area's ClientManager's onClientListen
     */
    addClientListener(clientId: any, areaId: any, options?: any): void;
    /**
     * Removes client from its own listeners
     * @param clientId
     * @param options
     */
    removeClientListener(clientId: any, options?: any): void;
}
export default ServerSystem;
