import { Entity } from './Entity';

export abstract class Component {
    // name of functions an entity gets by applying the component.
    public componentFunctions: Array<string>;
    public name: string;
    public entityId: string;
    public parentObject: any;
    public setAttribute?: Function;
    constructor(name){
        if (typeof(name) === 'undefined')
        {
            throw "Component: Invalid component name";
        }
        let parentObj = this.constructor.prototype;

        this.componentFunctions = Object.getOwnPropertyNames(parentObj).filter(p => {
            return typeof parentObj[p] === 'function' && parentObj[p] !== "constructor";
        });

        this.entityId = parentObj.id;

        this.setAttribute = parentObj.setAttribute ? parentObj.setAttribute.bind(parentObj) : null;

        this.name = name;
    }
    public abstract onRemoved(entity: Entity);

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
