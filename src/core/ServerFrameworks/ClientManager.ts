import  ServerSystem from '../System/ServerSystem';

export abstract class ClientManager extends ServerSystem {
    public writingClientIds: Set<any>;
    public listeningClientIds: Set<any>;

    constructor(name: string | number) {
        // needs to be a unique id
        super(name);
    }

    public abstract onClientWrite(clientId, options?) : void;
    public abstract onClientRemoveWrite(clientId, options?): void;
    public abstract onClientListen(clientId, options?): void;
    public abstract onClientRemoveListen(clientId, options?): void;
    public abstract onClientDisconnect(clientId, options?): void;

    // gets initialized in GottiColyseys AreaRoom constructor.
    // see https://github.com/visgotti/GottiColyseus/blob/master/src/AreaRoom.ts
    // I know this isn't the neatest way to decorate the system and i'll refactor it eventually but it is stable.

    /**
     * Sets a client to write to a specific area.
     * @param clientId - id of client to set
     * @param areaId - id of area the client will be writing to
     * @param options - options that get sent to the new area's ClientManager's onClientWrite
     */
    public setClientWrite(clientId, areaId, options?) {
        throw 'clientManager.setClientWrite should be overidden in area initialization before use.'
    };

    /**
     * Adds an area to the client to listen to.
     * @param clientId - client to add listener to
     * @param areaId - id of area that the client is listening to
     * @param options - options that get sent to the new area's ClientManager's onClientListen
     */
    public addClientListen(clientId, areaId, options?) {
        throw 'clientManager.addClientListen should be overidden in area initialization before use.'
    };

    /**
     * Removes client from its own listeners
     * @param clientId
     * @param options
     */
    public removeClientListener(clientId, options?) {
        throw 'removeClientListener should be overidden in area initialization before use.'
    };
}