import { Message, MessageQueue } from '../MessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { Entity } from '../Entity';
import { Component } from '../Component';
declare abstract class System {
    protected initialized: boolean;
    onRemoteMessage(message: Message): void;
    globals: any;
    private _serverGameData;
    protected messageQueue: MessageQueue | ServerMessageQueue;
    protected dispatchLocal: Function;
    protected dispatchAllLocal: Function;
    protected dispatchLocalInstant: Function;
    protected dispatchAllLocalInstant: Function;
    protected addEntity: Function;
    protected removeEntity: Function;
    readonly name: string | number;
    constructor(name: string | number);
    serverGameData: any;
    protected _onInit(): void;
    addMessageListener(messageName: string | number): void;
    removeMessageListener(messageName: string | number): void;
    abstract onLocalMessage(message: Message): void;
    abstract initialize(...args: any[]): void;
    abstract update(delta: any): void;
    abstract clear(): void;
    protected abstract addNetworkedFunctions(component: Component): void;
    initializeEntity(entity: Entity, data?: any): void;
    destroyEntity(entity: Entity): void;
    onEntityRemovedComponent(entity: any): void;
    onEntityAddedComponent(entity: any): void;
    onInit(): void;
    onStop(): void;
    onStart(): void;
    onServerDataUpdated(newData: any, oldData: any): void;
}
export default System;
