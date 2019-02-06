"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Component {
    constructor(name) {
        if (typeof (name) === 'undefined') {
            throw "Component: Invalid component name";
        }
        let parentObj = this.constructor.prototype;
        this.componentMethods = Object.getOwnPropertyNames(parentObj).filter(p => {
            return p !== "constructor" && p !== "prototype";
        });
        this.name = name;
    }
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
