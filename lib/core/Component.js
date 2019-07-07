"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Component {
    constructor(name, isNetworked = false) {
        // name of functions an entity gets by applying the component.
        this.componentMethods = [];
        this.setAttribute = () => { };
        this.setAttributeGetter = () => { };
        this.dispatchRemote = (message) => { };
        this.onRemote = (message) => { };
        this.isNetworked = isNetworked;
        if (typeof (name) === 'undefined') {
            throw "Component: Invalid component name";
        }
        let parentObj = this.constructor.prototype;
        this.componentMethods = Object.getOwnPropertyNames(parentObj).filter(p => {
            return p !== "constructor" && p !== "prototype" && p !== 'onAdded' && p !== 'onRemoved';
        });
        this.entityId = parentObj.id;
        this.name = name;
    }
    onAdded(entity) { }
    ;
    onRemoved(entity) { }
    ;
}
exports.Component = Component;
;
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
