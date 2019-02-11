import  ServerSystem from '../System/ServerSystem';

export abstract class ClientManager extends ServerSystem {
    constructor(name: string | number) {
        // needs to be a unique id
        super(name);
    }

    public abstract onClientWrite(clientId, options?) : void;
    public abstract onClientRemoveWrite(clientId, options?): void;
    public abstract onClientListen(clientId, options?): void;
    public abstract onClientRemoveListen(clientId, options?): void;
    public abstract onClientDisconnect(clientId, options?): void;

    // gets initialized by area room.
    public setClientWrite(clientId, areaId, options?) {
        throw 'clientManager.setClientWrite should be overidden in area initialization before use.'
    };

    public addClientListen(clientId, areaId, options?) {
        throw 'clientManager.addClientListen should be overidden in area initialization before use.'
    }

    public removeClientListener(clientId, options?) {
        throw 'removeClientListener should be overidden in area initialization before use.'
    };
}