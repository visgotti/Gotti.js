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

    protected dispatchLocal: Function;
    protected dispatchAllLocal: Function;
    protected dispatchLocalInstant: Function;
    protected dispatchAllLocalInstant: Function;
    /**
     * triggered when we call Gotti.resetGame(data) and a current game is running;
     */

    protected addEntity: Function;
    protected removeEntity: Function;

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
