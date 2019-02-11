import ServerSystem from '../System/ServerSystem';
export declare abstract class ClientManager extends ServerSystem {
    constructor(name: string | number);
    abstract onClientWrite(clientId: any, options?: any): void;
    abstract onClientRemoveWrite(clientId: any, options?: any): void;
    abstract onClientListen(clientId: any, options?: any): void;
    abstract onClientRemoveListen(clientId: any, options?: any): void;
    abstract onClientDisconnect(clientId: any, options?: any): void;
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
    addClientListen(clientId: any, areaId: any, options?: any): void;
    /**
     * Removes client from its own listeners
     * @param clientId
     * @param options
     */
    removeClientListener(clientId: any, options?: any): void;
}
