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
    clientId: number;
    gottiId: string;
    constructor(client: WebClient, isNetworked: boolean, globals?: any, options?: ClientProcessOptions);
    setClientIds(gottiId: any, clientId: any): void;
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
    onPeerConnectionRequest(peerId: any, systemName: number | string, options?: any): any;
    /**
     * When a peer connection is accepted and the peers are connected
     * @param peerId
     * @param options
     */
    onPeerConnection(peerIndex: number, options?: any): void;
    onPeerMissedPing(peerIndex: number, missedPings: number): void;
    startLoop(fps?: number): void;
    stopLoop(): void;
    clearGame(): void;
    startSystem(system: any): void;
    startAllSystems(): void;
    stopSystem(system: any): void;
    stopAllSystems(): void;
}
export {};
