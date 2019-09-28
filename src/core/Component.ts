import { Entity } from './Entity';

import { SystemPlug } from './System/System';

export abstract class Component {
    // name of functions an entity gets by applying the component.
    public componentMethods: Array<string> = [];
    public name: string | number;
    public setAttribute: Function = () => {};
    public setAttributeGetter: Function = () => {};
    public entityId: string | number;

    public $: SystemPlug;

    readonly emitions: [];

    constructor(name: string | number){
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
    public emit(event: string, payload: any) {};
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
