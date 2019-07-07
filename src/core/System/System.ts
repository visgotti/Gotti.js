import { Message, MessageQueue } from '../MessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { Entity } from '../Entity';
import { Mixin } from '../SystemMixin';
import ClientSystem from "./ClientSystem";
import ServerSystem from "./ServerSystem";

interface IMixin {
    new (...args: Array<any>): Mixin
}

abstract class System {
    protected initialized: boolean;

    public onRemoteMessage(message: Message) {};

    public globals: any;

    public mixins: Array<any>;

    private _serverGameData: any;

    protected props: any = {};
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
        this.removeMessageListener = this.messageQueue.removeGameSystemMessageListener.bind(this.messageQueue, this.name);
        this.dispatchLocal = this.messageQueue.add.bind(this.messageQueue);
        this.dispatchAllLocal = this.messageQueue.addAll.bind(this.messageQueue);
        this.dispatchLocalInstant = this.messageQueue.instantDispatch.bind(this.messageQueue);
        this.dispatchAllLocalInstant = this.messageQueue.instantDispatchAll.bind(this.messageQueue);

        if(this.mixins && this.mixins.length > 0) {
            let mixinLength = this.mixins.length;
            for(let i = 0; i < mixinLength; i++) {
                this.applyMixin(this.mixins[i]);
            }
        }

        this.onInit();
    }

    private applyAfterMixinHook(systemPropertyName, hookFunction) {
        if(!this[systemPropertyName]){
            throw new Error(`Applying hook to a non existent system method, ${systemPropertyName}`)
        }
        this[systemPropertyName] = (...args) => {
            this[systemPropertyName](...args);
            hookFunction.call(this, ...args);
        }
    }
    private applyBeforeMixinHook(systemPropertyName, hookFunction) {
        if(!this[systemPropertyName]){
            throw new Error(`Applying hook to a non existent system method, ${systemPropertyName}`)
        }
        this[systemPropertyName] = (...args) => {
            hookFunction.call(this, ...args);
            this[systemPropertyName](...args)
        }
    }

    private applyMixin(klass: IMixin) {
        console.log('the mixin Proto was', Object.getOwnPropertyNames(klass.prototype));
        let mixin = klass.prototype;
        Object.getOwnPropertyNames(mixin).forEach(mixinProp => {
            let systemPropertyName;
            if(mixinProp.substr(0, 5) === "after") {
                systemPropertyName = mixinProp.substr(5, mixinProp.length);
                systemPropertyName = systemPropertyName.charAt(0).toLowerCase() + systemPropertyName.slice(1);
                this.applyAfterMixinHook(systemPropertyName, mixin[mixinProp]);
            } else if(mixinProp.substr(0, 6) === "before") {
                systemPropertyName = mixinProp.substr(6, mixinProp.length);
                systemPropertyName = systemPropertyName.charAt(0).toLowerCase() + systemPropertyName.slice(1);
                this.applyBeforeMixinHook(systemPropertyName, mixin[mixinProp]);
            } else if(mixinProp === 'methods') {
                Object.keys(mixin.methods).forEach(methodName => {
                    if(this[methodName]) {
                        throw new Error(`Attempting to apply duplicate method name from mixin: ${methodName} on system: ${this.name}`)
                    }
                    this[methodName] = mixin.methods[methodName].bind(this);
                })
            } else if(mixinProp === 'props') {
                Object.keys(mixin.props).forEach(propName => {
                    if(this.props[propName]) {
                        throw new Error(`Attempting to apply duplicate prop from mixin: ${propName} on system: ${this.name}`)
                    }
                    if(Array.isArray(mixin.props[propName])) {
                        this.props[propName] = [ ...mixin.props[propName]]
                    }
                    else if(typeof mixin.props === 'object') {
                        this.props[propName] = { ...mixin.props[propName]}
                    } else {
                        this.props[propName] = mixin.props[propName]
                    }
                })
            }
        });
    }

    public addMessageListener(messageName: string | number) {
        throw new Error('addMessageListener must be called after the systems onInit function is executed');
    };

    public removeMessageListener(messageName: string | number) {
        throw new Error('removeMessageListener must be called after the systems onInit function is executed');
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
    public onServerDataUpdated(newData: any, oldData: any) {}
}

export default System;
