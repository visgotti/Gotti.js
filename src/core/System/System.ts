import { Message, MessageQueue } from '../MessageQueue';

abstract class System {
    protected initialized: boolean;

    public onRemoteMessage(message: Message) {};

    public globals: any = {};

    protected messageQueue: MessageQueue;

    protected dispatchLocal: Function;
    protected dispatchAllLocal: Function;
    protected dispatchLocalInstant: Function;
    protected dispatchAllLocalInstant: Function;

    readonly name: string | number;
    constructor(name: string | number) {
        if(!name && name !== 0) {
            throw 'Systems must be created with a valid name passed into the super constructor call.'
        }
        this.name = name;
    }

    protected _onInit() {
        this.dispatchLocal = this.messageQueue.add.bind(this.messageQueue);
        this.dispatchAllLocal = this.messageQueue.addAll.bind(this.messageQueue);
        this.dispatchLocalInstant = this.messageQueue.instantDispatch.bind(this.messageQueue);
        this.dispatchAllLocalInstant = this.messageQueue.instantDispatchAll.bind(this.messageQueue);
        this.onInit();
    }

    // if its a local message on server side it triggers onLocalServerMessage, if its a local
    // message on client it triggers onLocalClientMessage;
    public abstract onLocalMessage(message: Message) : void;
    public abstract initialize(...args: any[]): void;

    public abstract update (delta) : void;
    public abstract clear() : void;

    // optional
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public onGameDataUpdate() {};
}

export default System;
