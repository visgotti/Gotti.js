import { Message, MessageQueue } from '../MessageQueue';

abstract class System {
    private initialized: boolean;
    private entityMap: any;
    private messageQueue: MessageQueue;
    private gameState: any;
    private interfaceManager?: any;

    private dispatchLocal: Function;
    private dispatchRemote: Function;

    readonly name: string;
    constructor(name: string) {
        this.name = name;
    }

    public initialize(entityMap: any, gameState: any, messageQueue: MessageQueue, room: any, interfaceManager?) {
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

    public abstract update (delta) : void;
    public abstract onMessage(message: Message) : void;
    public abstract clear() : void;

    // optional
    public onInit() {};
    public onStop() {};
    public onStart() {};
}

export default System;
