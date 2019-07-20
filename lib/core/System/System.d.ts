import { Message, ClientMessageQueue } from '../ClientMessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { Entity } from '../Entity';
import { Component } from '../Component';
declare abstract class System {
    protected initialized: boolean;
    onRemoteMessage(message: Message): void;
    globals: any;
    private _serverGameData;
    protected messageQueue: ClientMessageQueue | ServerMessageQueue;
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
    /**
     * triggered when we remove a component from an entity
     * also triggered on destroyEntity MUST destroy entity with this.destroyEntity
     * @param entity - entity we removed component from
     * @param component - component we removed from entity
     */
    onEntityRemovedComponent(entity: any, component: Component): void;
    /**
     * triggered whenever we add a component to an entity
     * MUST initialize entity with this.initializeEntity
     * @param entity - entity we added component to
     * @param component - component we added to entity
     */
    onEntityAddedComponent(entity: any, component: Component): void;
    onInit(): void;
    onStop(): void;
    onStart(): void;
    onServerDataUpdated(newData: any, oldData: any): void;
}
export default System;
