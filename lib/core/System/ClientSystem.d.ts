import System from "./System";
import { Message, ClientMessageQueue } from '../ClientMessageQueue';
import { EntityManager } from "../EntityManager";
declare abstract class ClientSystem extends System {
    readonly name: string | number;
    private client;
    private gottiId;
    private clientId;
    private _peers;
    protected dispatchToServer: (message: Message) => void;
    protected dispatchProcessMessage: (messageName: string, payload: any) => void;
    protected immediateDispatchToServer: (message: Message) => void;
    isNetworked: boolean;
    private _peerMap;
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
    }, gottiId: any, clientId: any): void;
    abstract onServerMessage(message: Message): any;
    abstract onPeerMessage(peerId: number | string, message: Message): any;
    addListenStatePaths(path: string | Array<string>): void;
    onStateUpdate(pathString: any, pathData: any, change: any, value: any): void;
    onAreaWrite?(areaId: string | number, isInitial: boolean, options?: any): void;
    onAreaListen?(areaId: string | number, options?: any): void;
    onRemoveAreaListen?(areaId: string | number, options?: any): void;
    /**
     * Fired when a we succesfully connect to a peer player.
     * @param peerIndex - player index of connected player
     * @param options - options passed in either from either requestPeer or
     *                  returned from onPeerConnectionRequest
     */
    onPeerConnection?(peerIndex: number, options?: any): void;
    /**
     *
     * @param peerIndex - player index of disconnected peer
     * @param options - not implemented yet
     */
    onPeerDisconnection?(peerIndex: number, options?: any): void;
    /**
     * Fired when a we succesfully connect to a peer player.
     * @param peerIndex - player index of connected player
     * @param  missedPings - number of consecutive pings missed from a connected peer
     */
    onPeerMissedPing?(peerIndex: number, missedPings: number): void;
    /**
     * called when a peer makes a request from a system
     * @param peerId - player index of the client youre connecting to.
     * @param options - options sent over from the initial addPeer call.
     * returns anything truthy for a succesfully connection or false to deny the connection
     * the options will get passed to onPeerConnectionAccepted for the requester.
     */
    onPeerConnectionRequest?(peerIndex: number, options?: any): any | false;
    /**
     * triggers onPeerConnectionRequest on peer players computer
     * if the request went through
     * @param peerIndex - playerIndex/clientId
     * @param options - options passed into onPeerConnectionRequest options param for player youre requesting to.
     * @paramm ackTimeout - amount of time in ms you will wait to hear back from the client accepting your request, defaults to 3000
     * @param requestTimeout - amount of time in ms to wait for the accepted request to actually connect, defdults to 5000
     */
    requestPeer(peerIndex: number, options?: any, ackTimeout?: number, requestTimeout?: number): Promise<unknown>;
    readonly peers: any[];
    isPeer(playerIndex: any): boolean;
    getPeerPing(playerIndex: any): any;
    private _requestPeer;
    dispatchToPeer(toPeerId: string | number, message: Message): void;
    dispatchToPeers(toPeerIds: string | number, message: Message): void;
    dispatchToAllPeers(message: Message): void;
    removePeer(peerIndex: number): void;
}
export default ClientSystem;
