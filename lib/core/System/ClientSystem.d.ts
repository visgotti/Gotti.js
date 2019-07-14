import System from "./System";
import { Message, ClientMessageQueue } from '../ClientMessageQueue';
import { EntityManager } from "../EntityManager";
import { Component } from "../Component";
declare abstract class ClientSystem extends System {
    readonly name: string | number;
    private client;
    protected dispatchToServer: (message: Message) => void;
    protected dispatchProcessMessage: (messageName: string, payload: any) => void;
    protected immediateDispatchToServer: (message: Message) => void;
    isNetworked: boolean;
    constructor(name: string | number);
    /**
     * Initialize gets called by the process and
     * populates the system with the web client, message queue, and any
     * user defined variables you want all systems to have access to.
     * The web client
     * @param client - Gotti web client
     * @param messageQueue
     * @param globalSystemVariables - map of objects or values you want to be able to access in any system in the globals property.
     */
    initialize(client: any, messageQueue: ClientMessageQueue, entityManager: EntityManager, isNetworked: any, globalSystemVariables: {
        [reference: string]: any;
    }): void;
    abstract onServerMessage(message: Message): any;
    abstract onPeerMessage(peerId: number | string, message: Message): any;
    addNetworkedFunctions(component: Component): void;
    addListenStatePaths(path: string | Array<string>): void;
    onStateUpdate(pathString: any, pathData: any, change: any, value: any): void;
    onAreaWrite?(areaId: string | number, isInitial: boolean, options?: any): void;
    onAreaListen?(areaId: string | number, options?: any): void;
    onRemoveAreaListen?(areaId: string | number, options?: any): void;
    dispatchToPeer(toPeerId: string | number, message: Message): void;
    dispatchToPeers(toPeerIds: string | number, message: Message): void;
    dispatchToAllPeers(message: Message): void;
    addPeer(peerIndex: number): void;
    removePeer(peerIndex: number): void;
    getPeers(): Array<any>;
}
export default ClientSystem;
