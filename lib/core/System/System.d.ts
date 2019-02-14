import { Message, MessageQueue } from '../MessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { Entity } from '../Entity';
declare abstract class System {
    protected initialized: boolean;
    onRemoteMessage(message: Message): void;
    globals: any;
    protected messageQueue: MessageQueue | ServerMessageQueue;
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
    onComponentAdded(entity: Entity): void;
    onComponentRemoved(entity: Entity): void;
    onInit(): void;
    onStop(): void;
    onStart(): void;
    onGameDataUpdate(): void;
}
export default System;
