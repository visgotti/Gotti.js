import System from "./System";
import { WebClient } from '../WebClient';
import { Message, MessageQueue } from '../MessageQueue';

abstract class ClientSystem extends System {
    readonly name: string;
    private interfaceManager?: any;
    private client: WebClient;

    private dispatchToServer: (message: Message) => void;

    constructor(name: string, ) {
        super(name);
    }

    public initialize(entityMap: any, gameState: any, messageQueue: MessageQueue, client: WebClient, interfaceManager) {

        this.dispatchToServer = client.send;

        this.entityMap = entityMap;
        this.gameState = gameState;

        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);

        this.dispatchLocal = messageQueue.add;
        //     this.dispatchRemote = room.relayMessageQueue;

        this.interfaceManager = interfaceManager;
        this.initialized = true;

        this.onInit();
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
    public onStateUpdate(path, change, value) {};
}

export default ClientSystem;