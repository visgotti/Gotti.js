import ServerSystem from '../System/ServerSystem';
export declare const GOTTI_CLIENT_MANAGER_SYSTEM_CONSTANT = "GOTTI_CLIENT_MANAGER_SYSTEM";
export declare abstract class ClientManager extends ServerSystem {
    private _initialized;
    constructor(name?: string);
    initialized: boolean;
    abstract onClientWrite(clientId: any, options?: any): void;
    abstract onClientRemoveWrite(clientId: any, options?: any): void;
    abstract onClientListen(clientId: any, options?: any): void;
    abstract onClientRemoveListen(clientId: any, options?: any): void;
    abstract onClientDisconnect(clientId: any, options?: any): void;
    onClientRequestWrite(clientId: any, areaId: any, options?: any): any;
    onClientRequestRemoveWrite(clientId: any, areaId: any, options?: any): any;
    onClientRequestListen(clientId: any, options?: any): any;
    onClientRequestRemoveListen(clientId: any, options?: any): any;
    setClientWrite(clientId: any, areaId: any, options?: any): void;
    removeClientListener(clientId: any, options?: any): void;
}
