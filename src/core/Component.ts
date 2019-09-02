import { Entity } from './Entity';

export abstract class Component {
    // name of functions an entity gets by applying the component.
    public componentMethods: Array<string> = [];
    public name: string | number;
    public setAttribute: Function = () => {};
    public setAttributeGetter: Function = () => {};
    public isNetworked: boolean;

    // sends message in timed send interval
    public sendRemote: Function = (message) => {};
    // sends message as soon as function is called
    //TODO: no immediate from server to client yet will work same as sendRemote on server
    public sendRemoteImmediate: Function = (message) => {};

    // only works for server components
    public broadcastRemote: Function = (message) => {};

    public onRemote: Function = (message) => {};
    public entityId: string | number;

    constructor(name: string | number, isNetworked=false){
        this.isNetworked = isNetworked;
        if (typeof(name) === 'undefined')
        {
            throw "Component: Invalid component name";
        }
        let parentObj = this.constructor.prototype;
        this.componentMethods = Object.getOwnPropertyNames(parentObj).filter(p => {
            return p !== "constructor" && p !== "prototype" && p !== 'onAdded' && p !== 'onRemoved'
        });
        this.name = name;
    }

    public onAdded(entity: Entity) {};
    public onRemoved(entity: Entity) {};
};

/*
class ComponentFactory {
    public usedComponents: any = {};
    constructor() {
        this.componentFunctionsByName = {};
    }

    create(ComponentConstructor) {

    }

    getFunctions(componentName) {
        if(this.componentFunctionsByName[componentName] !== undefined) {
            return this.componentFunctionsByName[componentName];
        } else {
            this.componentFunctionsByName[componentName] =  Object.getOwnPropertyNames(parentObj).filter(p => {
                return typeof parentObj[p] === 'function' && parentObj[p] !== "constructor";
            });
        }
    }
}
*/
