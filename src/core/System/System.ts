import { Message, MessageQueue } from '../MessageQueue';

abstract class System {
    protected initialized: boolean;
    protected entityMap: any;
    protected messageQueue: MessageQueue;
    protected gameState: any;

    protected dispatchLocal: Function;
    protected dispatchRemote: Function;

    readonly name: string;
    constructor(name: string) {
        this.name = name;
    }

    // if its a local message on server side it triggers onLocalServerMessage, if its a local
    // message on client it triggers onLocalClientMessage;
    public abstract onLocalMessage(message: Message) : void;
    public abstract onRemoteMessage(message: Message): void;

    public abstract update (delta) : void;
    public abstract clear() : void;

    // optional
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public onGameDataUpdate() {};
}

export default System;
