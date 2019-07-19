import System from "./System";
import { Message, ClientMessageQueue } from '../ClientMessageQueue';
import { EntityManager } from "../EntityManager";
import { Component } from "../Component";
declare abstract class ClientSystem extends System {
    readonly name: string | number;
    private client;
    private _peers;
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
    onPeerConnection?(peerId: any, options?: any): any | false;
    onPeerDisconnection?(peerId: any, options?: any): void;
    /**
     * called when a peer makes a request from a system
     * @param peerId - player index of the client youre connecting to.
     * @param options - options sent over from the initial addPeer call.
     * returns anything truthy for a succesfully connection or false to deny the connection
     * the options will get passed to onPeerConnectionAccepted for the requester.
     */
    onPeerConnectionRequested?(peerId: any, options?: any): any | false;
    onPeerConnectionAccepted?(peerId: any, options?: any): void;
    onPeerConnectionRejected?(peerId: any): void;
    requestPeer(peerId: number, options?: any): void;
    onPeerConnectionClosed?(peerId: any): void;
    readonly peers: any[];
    isPeer(playerIndex: any): boolean;
    dispatchToPeer(toPeerId: string | number, message: Message): void;
    dispatchToPeers(toPeerIds: string | number, message: Message): void;
    dispatchToAllPeers(message: Message): void;
    addPeer(peerIndex: number, systemName: string | number, options?: any): void;
    removePeer(peerIndex: number): void;
}
export default ClientSystem;
