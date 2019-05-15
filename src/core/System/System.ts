import { Message, MessageQueue } from '../MessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { Entity } from '../Entity';

abstract class System {
    protected initialized: boolean;

    public onRemoteMessage(message: Message) {};

    public globals: any;
    private _serverGameData: any;

    protected messageQueue: MessageQueue | ServerMessageQueue;

    protected dispatchLocal: Function;
    protected dispatchAllLocal: Function;
    protected dispatchLocalInstant: Function;
    protected dispatchAllLocalInstant: Function;

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
        this.dispatchLocal = this.messageQueue.add.bind(this.messageQueue);
        this.dispatchAllLocal = this.messageQueue.addAll.bind(this.messageQueue);
        this.dispatchLocalInstant = this.messageQueue.instantDispatch.bind(this.messageQueue);
        this.dispatchAllLocalInstant = this.messageQueue.instantDispatchAll.bind(this.messageQueue);
        this.onInit();
    }

    public addMessageListener(messageName: string | number) {
        throw new Error('addMessageListener must be called after the systems onInit function is executed');
    };

    // if its a local message on server side it triggers onLocalServerMessage, if its a local
    // message on client it triggers onLocalClientMessage;
    public abstract onLocalMessage(message: Message) : void;
    public abstract initialize(...args: any[]): void;

    public abstract update (delta) : void;
    public abstract clear() : void;

    //overrided in ServerSystem and ClientSystem initialize function
    public initializeEntity(entity:Entity, data?: any) {};
    public destroyEntity(entity:Entity) {};

    // optional
    public onEntityRemovedComponent(entity) {};
    public onEntityAddedComponent(entity) {};
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public onGameDataUpdate() {};
    public onServerDataUpdated(newData: any, oldData: any) {}
}

export default System;
