import { Message, MessageQueue } from '../MessageQueue';
declare abstract class System {
    protected initialized: boolean;
    protected entityMap: any;
    protected messageQueue: MessageQueue;
    protected gameState: any;
    protected dispatchLocal: Function;
    protected dispatchRemote: Function;
    readonly name: string;
    constructor(name: string);
    abstract onLocalMessage(message: Message): void;
    abstract onRemoteMessage(message: Message): void;
    abstract update(delta: any): void;
    abstract clear(): void;
    onInit(): void;
    onStop(): void;
    onStart(): void;
    onGameDataUpdate(): void;
}
export default System;
