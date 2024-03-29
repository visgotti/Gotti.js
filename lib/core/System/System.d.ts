import { Message, ClientMessageQueue } from '../ClientMessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { Entity } from '../Entity';
import { Component } from '../Component';
import * as EventEmitter from "eventemitter3";
import { IPlugin } from "../Plugin/Plugin";
export interface SystemPlug extends EventEmitter {
    [key: string]: any;
}
declare abstract class System {
    protected initialized: boolean;
    onRemoteMessage(message: Message): void;
    installPlugin(plugin: IPlugin): void;
    addApi: (method: (...args: any[]) => any, name?: string) => void;
    globals: any;
    $: SystemPlug;
    $api: {
        [methodNamme: string]: (...args: any[]) => any;
    };
    private _serverGameData;
    protected messageQueue: ClientMessageQueue | ServerMessageQueue;
    dispatchLocal: Function;
    dispatchAllLocal: Function;
    dispatchLocalInstant: Function;
    dispatchAllLocalInstant: Function;
    /**
     * triggered when we call Gotti.resetGame(data) and a current game is running;
     */
    protected addEntity: Function;
    protected removeEntity: Function;
    private entityEventHandlers;
    readonly name: string | number;
    constructor(name: string | number);
    set serverGameData(newData: any);
    get serverGameData(): any;
    protected _onInit(): void;
    addMessageListener(messageName: string | number): void;
    removeMessageListener(messageName: string | number): void;
    getSystemComponent(entity: Entity): any;
    _onEntityRemovedComponent(entity: Entity, component: Component): void;
    onEntityEvent(entity: Entity, eventName: string, callback: (eventData: any) => void): void;
    offEntityEvent(entity: any, eventName: string): boolean;
    abstract onLocalMessage(message: Message): void;
    abstract initialize(...args: any[]): void;
    update?(delta: any): void;
    abstract onClear(): void;
    onResetGame?(afterAllReset: (cb: Function) => void, data?: any): Promise<void>;
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
    onRestart(): void;
    onServerDataUpdated(newData: any, oldData: any): void;
}
export default System;
