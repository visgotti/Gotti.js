import { Process } from './Process';
import { Client as WebClient } from '../WebClient/Client';
import { ClientMessageQueue } from '../ClientMessageQueue';
interface ClientProcessOptions {
    fpsTickRate?: number;
}
export declare class ClientProcess extends Process<ClientProcess> {
    client: WebClient;
    private fpsTickRate;
    messageQueue: ClientMessageQueue;
    isNetworked: boolean;
    peers: Array<number>;
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
     * If a connected peer disconnects we trigger this function and then all of the systems
     * @param peerId
     * @param options
     */
    onPeerDisconnection(peerId: any, options?: any): void;
    /**
     * When a peer connection is accepted and the peers are connected
     * @param peerId
     * @param options
     */
    onPeerConnection(peerId: any, options?: any): void;
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param options - options sent back from area when the client was removed.
     */
    dispatchOnRemoveAreaListen(areaId: any, options?: any): void;
    /**
     * when we receive a peer connection request if the system doesnt have a onPeerConnectionRequested handler
     * we automatically return false and fail the peer connection
     * @param peerId
     * @param systemName
     * @param options
     */
    onPeerConnectionRequested(peerId: any, systemName: number | string, options?: any): any;
    /**
     * If the peer returns their onPeerConnectionRequested with anything truthy it will
     * be passed in to the systems onPeerConnectionAccepted as the options
     * @param peerId
     * @param systemName
     * @param options
     */
    onPeerConnectionAccepted(peerId: any, systemName: number | string, options?: any): void;
    /**
     * If the peer returns their onPeerConnectionRequested with anything falsey or
     * it was just not possible to begin with, this will get triggered.
     * @param peerId
     * @param systemName
     * @param options
     */
    onPeerConnectionRejected(peerId: any, systemName: number | string): void;
    startLoop(fps?: number): void;
    stopLoop(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
export {};
