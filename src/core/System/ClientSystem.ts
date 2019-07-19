import System from "./System";
import { Client as WebClient } from '../WebClient/Client';
import { Message, ClientMessageQueue } from '../ClientMessageQueue';
import {EntityManager} from "../EntityManager";
import { Component } from "../Component";

abstract class ClientSystem extends System {
    readonly name: string | number;
    private client: WebClient;

    private _peers: Array<any>;

    // sends system message to server to be processed on next game tick
    protected dispatchToServer: (message: Message) => void;

    // raises a message that you can register a handler from a web client using client.onProcessMessage();
    protected dispatchProcessMessage: (messageName: string, payload: any) => void;

    // sends system to message that gets processed as soon as it is received.
    protected immediateDispatchToServer: (message: Message) => void;

    public isNetworked: boolean = false;

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
    public initialize(client, messageQueue: ClientMessageQueue, entityManager: EntityManager, isNetworked, globalSystemVariables: {[reference: string]: any})
    {
        this.isNetworked = isNetworked;
        if(globalSystemVariables && typeof globalSystemVariables === 'object') {
            this.globals = globalSystemVariables;
        }

        this._peers = client.connector.connectedPeerIndexes;

        this.client = client;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);

        this.dispatchProcessMessage = client.raiseMessage.bind(client);
        this.initializeEntity = entityManager.initializeEntity.bind(entityManager);
        this.destroyEntity = entityManager.destroyEntity.bind(entityManager);

        this.dispatchToServer = client.sendSystemMessage.bind(client);
        this.immediateDispatchToServer = client.sendImmediateSystemMessage.bind(client);
        this.initialized = true;

        this.dispatchToPeer = client.connector.sendPeerMessage.bind(client.connector);
        this.dispatchToAllPeers = client.connector.sendAllPeersMessage.bind(client.connector);
        this.dispatchToPeers = client.connector.sendPeersMessage.bind(client.connector);
        this.addPeer = client.connector.startPeerConnection.bind(client.connector);
        this.removePeer = client.connector.stopPeerConnection.bind(client.connector);
        this._onInit();
    }

    public abstract onServerMessage(message: Message);

    public abstract onPeerMessage(peerId: number | string, message: Message);

    public addNetworkedFunctions(component: Component): void {
        if(this.isNetworked) { // make sure client system is networked before binding
            component.sendRemote = this.dispatchToServer.bind(this);
            component.sendRemoteImmediate = this.immediateDispatchToServer.bind(this);
            //client side components dont broadcast so just execute empty func if called
            component.broadcastRemote = (message) => {};
        }
    }

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

    public onPeerConnection?(peerId, options?) : any | false;
    public onPeerDisconnection?(peerId, options?) : void;


    /**
     * called when a peer makes a request from a system
     * @param peerId - player index of the client youre connecting to.
     * @param options - options sent over from the initial addPeer call.
     * returns anything truthy for a succesfully connection or false to deny the connection
     * the options will get passed to onPeerConnectionAccepted for the requester.
     */
    public onPeerConnectionRequested?(peerId, options?) : any | false;
    public onPeerConnectionAccepted?(peerId, options?) : void;
    public onPeerConnectionRejected?(peerId) : void;

    public requestPeer(peerId: number, options?: any) {
        if(!this.onPeerConnectionAccepted || !this.onPeerConnectionRequested) {
            throw new Error(`Cannot add a peer from the system ${this.name} it does not implement both onPeerConnectionAccepted and onPeerConnectionRequested`);
        }
        this.addPeer(peerId, this.name, options);
    }
    // channels combined of p2p up to 1 guy hosting 2 others

    // connector server removes 2 others from area server.. start instance of area server on pc?????????????????????


    // player 1    - area 1  - client 1 - player 3       player 4 > { x: y } player 5
    // player 2    -                    - player 4




    public onPeerConnectionClosed?(peerId): void;

    get peers() {
        return this._peers;
    }

    public isPeer(playerIndex) {
        return this._peers.indexOf(playerIndex) > -1;
    }

    // overrided in process decoration
    public dispatchToPeer(toPeerId: string | number, message: Message) {};
    public dispatchToPeers(toPeerIds: string | number, message: Message) {};
    public dispatchToAllPeers(message: Message) {};
    public addPeer(peerIndex: number, systemName: string | number, options?) {};
    public removePeer(peerIndex: number) {};
}

export default ClientSystem;