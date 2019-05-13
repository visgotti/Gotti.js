import { Process } from './Process';
import { Client as WebClient } from '../WebClient/Client';
import { MessageQueue } from '../MessageQueue';
interface ClientProcessOptions {
    fpsTickRate?: number;
}
export declare class ClientProcess extends Process<ClientProcess> {
    client: WebClient;
    private fpsTickRate;
    messageQueue: MessageQueue;
    isNetworked: boolean;
    constructor(client: WebClient, isNetworked: boolean, globals?: any, options?: ClientProcessOptions);
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param isInitial - boolean indicating if this is the first area the client is joining
     * @param options - options sent back from area when accepting the write request.
     */
    dispatchOnAreaWrite(areaId: any, isInitial: boolean, options?: any): void;
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param state - state of the area you receive upon listening
     * @param options - options sent back from area when it added the client as listener
     */
    dispatchOnAreaListen(areaId: any, state: any, options?: any): void;
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param options - options sent back from area when the client was removed.
     */
    dispatchOnRemoveAreaListen(areaId: any, options?: any): void;
    startLoop(fps?: number): void;
    stopLoop(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
export {};
