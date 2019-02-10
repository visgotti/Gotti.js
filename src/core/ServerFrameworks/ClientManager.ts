import  ServerSystem from '../System/ServerSystem';

export const GOTTI_CLIENT_MANAGER_SYSTEM_CONSTANT = 'GOTTI_CLIENT_MANAGER_SYSTEM';

export abstract class ClientManager extends ServerSystem {
    private _initialized: boolean = false;
    constructor(name=GOTTI_CLIENT_MANAGER_SYSTEM_CONSTANT) {
        // needs to be a unique id
        super(GOTTI_CLIENT_MANAGER_SYSTEM_CONSTANT);
    }

    get initialized() {
        return this._initialized;
    }

    set initialized(value: boolean) {
        if(this._initialized) {
            throw new Error('Client Manager was already initialized')
        }
        this._initialized = true;
    }

    public abstract onClientWrite(clientId, options?) : void;
    public abstract onClientRemoveWrite(clientId, options?): void;
    public abstract onClientListen(clientId, options?): void;
    public abstract onClientRemoveListen(clientId, options?): void;
    public abstract onClientDisconnect(clientId, options?): void;

    /**
     * sends a message to the client telling it that it should be using
     * this area room as its writer.
     * @param clientId - id of the client on the connector server.
     * @param options
     */
    public onClientRequestWrite(clientId, areaId, options?): any {
        return true
    }
    public onClientRequestRemoveWrite(clientId, areaId, options?): any {
        return true
    }
    public onClientRequestListen(clientId, options?): any {
        return true
    }
    public onClientRequestRemoveListen(clientId, options?): any {
        return true
    }

    // gets initialized by area room.
    public setClientWrite(clientId, areaId, options?) {
        throw 'clientManager.setClientWrite should be overidden in area initialization before use.'
    };

    public setClientListen(clientId, areaId, options?) {
        throw 'clientManager.setClientListen should be overidden in area initialization before use.'
    }

    public removeClientListener(clientId, options?) {
        throw 'removeClientListener should be overidden in area initialization before use.'
    };
}