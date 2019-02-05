import System from "./System";
import { WebClient } from '../WebClient/Client';
import { Message, MessageQueue } from '../MessageQueue';

abstract class ClientSystem extends System {
    readonly name: string;
    private client: WebClient;

    private dispatchToServer: (message: Message) => void;

    constructor(name: string) {
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
     * @param globalSystemVariables - map of objects or values you want to be able to access in any system as a object property.
     */
    public initialize(client, messageQueue, globalSystemVariables: {[reference: string]: any})
    {
        Object.keys(globalSystemVariables).forEach((referenceName) => {
            if(referenceName in this) {
                throw new Error(`Can not have a global object that shares a reference with native system class: ${key}`);
            }
            this[referenceName] = globalSystemVariables[key];
        });

        this.client = client;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);

        this.dispatchToServer = client.send;
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
}

export default ClientSystem;