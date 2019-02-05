"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Component {
    constructor(name) {
        if (typeof (name) === 'undefined') {
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
