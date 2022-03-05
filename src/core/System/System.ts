import { Message, ClientMessageQueue } from '../ClientMessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { Entity } from '../Entity';
import { Component } from '../Component';

import * as EventEmitter from "eventemitter3";
import {IPlugin} from "../Plugin/Plugin";

export interface SystemPlug extends EventEmitter {
    [key: string]: any,
}

abstract class System {
    protected initialized: boolean;

    public onRemoteMessage(message: Message) {};

    // overrided in process addSystem function
    public installPlugin(plugin: IPlugin) {};

    public addApi : (method: (...args: any[]) => any, name?: string) => void;

    public globals: any;

    public $: SystemPlug = new EventEmitter();
    public $api: {[methodNamme: string] : (...args: any[]) => any };

    private _serverGameData: any;

    protected messageQueue: ClientMessageQueue | ServerMessageQueue;

    public dispatchLocal: Function;
    public dispatchAllLocal: Function;
    public dispatchLocalInstant: Function;
    public dispatchAllLocalInstant: Function;
    /**
     * triggered when we call Gotti.resetGame(data) and a current game is running;
     */

    protected addEntity: Function;
    protected removeEntity: Function;

    private entityEventHandlers: {[entityId: string]: { 
        entity: Entity,
        listeners: {
        [eventName: string]: Function
    }}} = {};

    readonly name: string | number;
    constructor(name: string | number) {
        if(!name && name !== 0) {
            throw 'Systems must be created with a valid name passed into the super constructor call.'
        }
        this.name = name;
    }

    set serverGameData(newData) {
        const oldServerData = { ...this._serverGameData };
        this._serverGameData = newData;
        this.onServerDataUpdated(newData, oldServerData);
    }

    get serverGameData() {
        return this._serverGameData;
    }

    protected _onInit() {
        this.addMessageListener = this.messageQueue.addGameSystemMessageListener.bind(this.messageQueue, this.name);
        this.removeMessageListener = this.messageQueue.removeGameSystemMessageListener.bind(this.messageQueue, this.name);
        this.dispatchLocal = this.messageQueue.add.bind(this.messageQueue);
        this.dispatchAllLocal = this.messageQueue.addAll.bind(this.messageQueue);
        this.dispatchLocalInstant = this.messageQueue.instantDispatch.bind(this.messageQueue);
        this.dispatchAllLocalInstant = this.messageQueue.instantDispatchAll.bind(this.messageQueue);
        this.onInit();
    }

    public addMessageListener(messageName: string | number) {
        throw new Error('addMessageListener must be called after the systems onInit function is executed');
    };

    public removeMessageListener(messageName: string | number) {
        throw new Error('removeMessageListener must be called after the systems onInit function is executed');
    };

    public getSystemComponent(entity: Entity) {
        if(!entity) return null;
        return entity.getComponent(this.name);
    }

    public _onEntityRemovedComponent(entity: Entity, component: Component) {
        if(this.entityEventHandlers[entity.id]) {
            const eventNameKeys = Object.keys(this.entityEventHandlers[entity.id].listeners);
            eventNameKeys.forEach(k => this.offEntityEvent(entity, k));
        }
        this.onEntityRemovedComponent(entity, component);
    }


    // helper function for systems that will store callback references per entity to track and remove when entity removes component.
    public onEntityEvent(entity: Entity, eventName: string, callback: (eventData: any) => void) {
        if(!(entity.id in this.entityEventHandlers)) {
            this.entityEventHandlers[entity.id] = { entity, listeners: {} };
        }
        if(this.entityEventHandlers[entity.id].entity !== entity) {
            throw new Error(`Trying to listen on entity event with same id ${entity.id} but different entity was already registered.. this means you probably have two entities with the same id which is BAD.`)
        }
        if(this.entityEventHandlers[entity.id].listeners[eventName]) {
            throw new Error(`Already have a registered event for event: ${eventName} on entity: ${entity.id} for system: ${this.name}. Systems can only have 1 callback per entity event.`)
        }
        this.entityEventHandlers[entity.id].listeners[eventName] = callback;
        entity.on(eventName, callback);
    }

    public offEntityEvent(entity, eventName: string) : boolean {
        if(!(entity.id in this.entityEventHandlers)) return false;
        if(this.entityEventHandlers[entity.id].entity !== entity) {
            throw new Error(`Trying to listen on entity event with same id ${entity.id} but different entity was already registered.. this means you probably have two entities with the same id which is BAD.`)
        }
        const callback = this.entityEventHandlers[entity.id].listeners[eventName];
        if(!callback) return false;
        entity.off(eventName, callback);
        delete this.entityEventHandlers[entity.id].listeners[eventName];
        if(!(Object.keys(this.entityEventHandlers[entity.id].listeners).length)) {
            delete this.entityEventHandlers[entity.id];
        }
        return true;
    }

    // if its a local message on server side it triggers onLocalServerMessage, if its a local
    // message on client it triggers onLocalClientMessage;
    public abstract onLocalMessage(message: Message) : void;
    public abstract initialize(...args: any[]): void;

    public update? (delta) : void;
    public abstract onClear() : void;
    // optional system hooks
    public async onResetGame? (afterAllReset: (cb: Function) => void, data?: any) : Promise<void>;

    //overrided in ServerSystem and ClientSystem initialize function
    public initializeEntity(entity:Entity, data?: any) {};
    public destroyEntity(entity:Entity) {};

    // optional

    /**
     * triggered when we remove a component from an entity
     * also triggered on destroyEntity MUST destroy entity with this.destroyEntity
     * @param entity - entity we removed component from
     * @param component - component we removed from entity
     */
    public onEntityRemovedComponent(entity, component: Component) {};
    /**
     * triggered whenever we add a component to an entity
     * MUST initialize entity with this.initializeEntity
     * @param entity - entity we added component to
     * @param component - component we added to entity
     */
    public onEntityAddedComponent(entity, component: Component) {};

    // triggered when the system gets added to an initialized game process
    public onInit() {};
    // triggered when the the system is stopped because an area you switched to does not use the system
    public onStop() {};
    // triggered when the the system is started and the update loop becomes callable
    public onStart() {};
    // triggered when processes change but both processes use the system.
    public onRestart() {};
    public onServerDataUpdated(newData: any, oldData: any) {}
}

export default System;
