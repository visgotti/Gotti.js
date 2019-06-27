import System from "./System";
import { Client as WebClient } from '../WebClient/Client';
import { Message, MessageQueue } from '../MessageQueue';
import {EntityManager} from "../EntityManager";

abstract class ClientSystem extends System {
    readonly name: string | number;
    private client: WebClient;

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
    public initialize(client, messageQueue: MessageQueue, entityManager: EntityManager, isNetworked, globalSystemVariables: {[reference: string]: any})
    {
        this.isNetworked = isNetworked;
        if(globalSystemVariables && typeof globalSystemVariables === 'object') {
            this.globals = globalSystemVariables;
        }

        this.client = client;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);

        this.dispatchProcessMessage = client.raiseMessage.bind(client);
        this.initializeEntity = entityManager.initializeEntity.bind(entityManager);
        this.destroyEntity = entityManager.destroyEntity.bind(entityManager);

        this.dispatchToServer = client.sendSystemMessage.bind(client);
        this.immediateDispatchToServer = client.sendImmediateSystemMessage.bind(client);
        this.initialized = true;
        this._onInit();
    }

    public abstract onServerMessage(message: Message);

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
}

export default ClientSystem;