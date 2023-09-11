import System from "./System";
import { Client as WebClient } from '../WebClient/Client';
import { Message, ClientMessageQueue } from '../ClientMessageQueue';
import {EntityManager} from "../EntityManager";
import { Component } from "../Component";

abstract class ClientSystem extends System {
    readonly name: string | number;
    private client: WebClient;

    private gottiId: string;
    private clientId: number;

    private _peers: Array<any>;

    // sends system message to server to be processed on next game tick
    protected dispatchToServer: (message: Message) => void;

    // raises a message that you can register a handler from a web client using client.onProcessMessage();
    protected dispatchProcessMessage: (messageName: string, payload: any) => void;

    // sends system to message that gets processed as soon as it is received.
    protected immediateDispatchToServer: (message: Message) => void;

    public isNetworked: boolean = false;

    private _peerMap: any;

    constructor(name: string | number) {
        super(name);
        this.onRemoteMessage = this.onServerMessage.bind(this);
    }


    /**
     * Initialize gets called by the process and
     * populates the system with the web client, message queue, and any
     * user defined variables you want all systems to have access to.
     * The web client
     * @param client - Gotti web client
     * @param messageQueue
     * @param globalSystemVariables - map of objects or values you want to be able to access in any system in the globals property.
     */
    public initialize(client, messageQueue: ClientMessageQueue, entityManager: EntityManager, isNetworked, globalSystemVariables: {[reference: string]: any}, gottiId, clientId)
    {
        this.isNetworked = isNetworked;
        if(globalSystemVariables && typeof globalSystemVariables === 'object') {
            this.globals = globalSystemVariables;
        }
        this.gottiId = gottiId;
        this.clientId = clientId;
        this._peers = client.connector.connectedPeerIndexes;
        this._peerMap = client.connector.peerConnections;
        this.client = client;
        this.messageQueue = messageQueue;
        this.dispatchProcessMessage = client.raiseMessage.bind(client);
        this.initializeEntity = entityManager.initializeEntity.bind(entityManager);
        this.destroyEntity = entityManager.destroyEntity.bind(entityManager);

        this.dispatchToServer = client.sendSystemMessage.bind(client);
        this.immediateDispatchToServer = client.sendImmediateSystemMessage.bind(client);
        this.initialized = true;

        this.dispatchToPeer = client.connector.sendPeerMessage.bind(client.connector);
        this.dispatchToAllPeers = client.connector.sendAllPeersMessage.bind(client.connector);
        this.dispatchToPeers = client.connector.sendPeersMessage.bind(client.connector);
        this._requestPeer = client.connector.requestPeerConnection.bind(client.connector);
        this.removePeer = client.connector.stopPeerConnection.bind(client.connector);
        this._onInit();
    }

    public abstract onServerMessage(message: Message);
    public abstract onPeerMessage(peerId: number | string, message: Message);

    public addListenStatePaths(path: string | Array<string>) {
        if (Array.isArray(path)) {
            path.forEach(p => {
                // confirm its valid path maybe?
                this.client.addSystemPathListener(this, p);
            });
        } else {
            this.client.addSystemPathListener(this, path);
        }
    };

    //TODO: would be cool to do a runtime static code check to make sure onStateUpdate implements all listeners
    public onStateUpdate(pathString, pathData, change, value) {};

    public onAreaWrite?(areaId: string | number, isInitial: boolean, options?): void;
    public onAreaListen?(areaId: string | number, options?): void;
    public onRemoveAreaListen?(areaId: string | number, options?): void;

    /**
     * Fired when a we succesfully connect to a peer player.
     * @param peerIndex - player index of connected player
     * @param options - options passed in either from either requestPeer or
     *                  returned from onPeerConnectionRequest
     */
    public onPeerConnection?(peerIndex: number, options?) : void;

    /**
     *
     * @param peerIndex - player index of disconnected peer
     * @param options - not implemented yet
     */
    public onPeerDisconnection?(peerIndex: number, options?) : void;

    /**
     * Fired when a we succesfully connect to a peer player.
     * @param peerIndex - player index of connected player
     * @param  missedPings - number of consecutive pings missed from a connected peer
     */
    public onPeerMissedPing?(peerIndex: number, missedPings: number): void;

    /**
     * called when a peer makes a request from a system
     * @param peerId - player index of the client youre connecting to.
     * @param options - options sent over from the initial addPeer call.
     * returns anything truthy for a succesfully connection or false to deny the connection
     * the options will get passed to onPeerConnectionAccepted for the requester.
     */
    public async onPeerConnectionRequest?(peerIndex: number , options?) : Promise<any | false>;

    /**
     * triggers onPeerConnectionRequest on peer players computer
     * if the request went through
     * @param peerIndex - playerIndex/clientId
     * @param options - options passed into onPeerConnectionRequest options param for player youre requesting to.
     * @paramm ackTimeout - amount of time in ms you will wait to hear back from the client accepting your request, defaults to 3000
     * @param requestTimeout - amount of time in ms to wait for the accepted request to actually connect, defdults to 5000
     */
    public async requestPeer(peerIndex: number, options?: any, ackTimeout?: number, requestTimeout?: number) {
        if(!this.onPeerConnectionRequest) {
            throw new Error(`Cannot add a peer from the system ${this.name} it does not implement onPeerConnectionRequest`);
        }
        return new Promise((resolve, reject) => {
            this._requestPeer(peerIndex, this.name, options, (err, options) => {
                if(err) {
                    return reject(err);
                } else {
                    options = options ? options : true;
                    return resolve(options);
                }
            }, ackTimeout, requestTimeout);
        });
    }

    get peers() {
        return this._peers;
    }

    public isPeer(playerIndex) {
        for(let i = 0; i < this._peers.length; i++) {
            if(this._peers[i] == playerIndex) return true;
        }
        return false;
    }

    public getPeerPing(playerIndex) {
        const peerConnection = this._peerMap[playerIndex];
        if(peerConnection && peerConnection.connected) {
            return peerConnection.ping;
        }
        return null;
    }

    // overrided in process decoration
    private _requestPeer(peerIndex: number, systemName: string | number, options: any,  callback: Function, ackTimeout?: number, requestTimeout?: number) {};

    public dispatchToPeer(toPeerId: string | number, message: Message) {};
    public dispatchToPeers(toPeerIds: string | number, message: Message) {};
    public dispatchToAllPeers(message: Message) {};
    public removePeer(peerIndex: number) {};
}

export default ClientSystem;