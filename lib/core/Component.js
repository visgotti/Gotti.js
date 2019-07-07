"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Component {
    constructor(name, isNetworked = false) {
        // name of functions an entity gets by applying the component.
        this.componentMethods = [];
        this.setAttribute = () => { };
        this.setAttributeGetter = () => { };
        // sends message in timed send interval
        this.sendRemote = (message) => { };
        // sends message as soon as function is called
        //TODO: no immediate from server to client yet will work same as sendRemote on server
        this.sendRemoteImmediate = (message) => { };
        // only works for server components
        this.broadcastRemote = (message) => { };
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
