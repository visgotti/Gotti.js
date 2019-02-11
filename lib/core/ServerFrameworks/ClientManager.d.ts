import ServerSystem from '../System/ServerSystem';
export declare abstract class ClientManager extends ServerSystem {
    constructor(name: string | number);
    abstract onClientWrite(clientId: any, options?: any): void;
    abstract onClientRemoveWrite(clientId: any, options?: any): void;
    abstract onClientListen(clientId: any, options?: any): void;
    abstract onClientRemoveListen(clientId: any, options?: any): void;
    abstract onClientDisconnect(clientId: any, options?: any): void;
    setClientWrite(clientId: any, areaId: any, options?: any): void;
    addClientListen(clientId: any, areaId: any, options?: any): void;
    removeClientListener(clientId: any, options?: any): void;
}
