import { Message, MessageQueue } from '../MessageQueue';
declare abstract class System {
    protected initialized: boolean;
    onRemoteMessage(message: Message): void;
    globals: {
        [name: string]: any;
    };
    protected messageQueue: MessageQueue;
    protected gameState: any;
    protected dispatchLocal: Function;
    protected dispatchAllLocal: Function;
    protected dispatchLocalInstant: Function;
    protected dispatchAllLocalInstant: Function;
    readonly name: string | number;
    constructor(name: string | number);
    protected _onInit(): void;
    abstract onLocalMessage(message: Message): void;
    abstract initialize(...args: any[]): void;
    abstract update(delta: any): void;
    abstract clear(): void;
    onInit(): void;
    onStop(): void;
    onStart(): void;
    onGameDataUpdate(): void;
}
export default System;
