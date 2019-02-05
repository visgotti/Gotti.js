"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Entity {
    constructor(id, type) {
        // Generate a pseudo random ID
        this.id = id;
        this.type = type;
        // The component data will live in this object
        this.components = {};
        // this is a map of all the functions received from the component
        this.functionsFromComponent = {};
        return this;
    }
    onMessage(message) { }
    /**
     * Adds the component to an Entity, giving it all the functionality from the methods defined.
     * @param component
     * @returns {Entity}
     */
    addComponent(component) {
        if (this.hasComponent(component.name)) {
            throw `Entity ${this.id} trying to add ${component.name} twice `;
        }
        this.components[component.name] = component;
        this.functionsFromComponent[component.name] = component.componentFunctions;
        for (var i = 0; i < component.componentFunctions.length; i++) {
            let funcName = component.componentFunctions[i];
            if (this[funcName] !== undefined) {
                throw (`Duplicated function ${funcName} names in component ${component.name} attached to an entity.`);
            }
            this[funcName] = component[funcName].bind(component);
        }
        return this;
    }
    // checks if the compnentName is referenced in the entity.
    hasComponent(componentName) {
        return this.components[componentName] !== undefined;
    }
    removeComponent(componentName) {
        const component = this.components[componentName];
        if (component === undefined) {
            throw `Entity ${this.id} trying to remove non existening component ${componentName} `;
        }
        delete this.components[componentName];
        for (var i = 0; i < this.functionsFromComponent[componentName].length; i++) {
            delete this[this.functionsFromComponent[componentName][i]];
        }
        delete this.functionsFromComponent[componentName];
        component.onRemoved(this);
    }
}
exports.Entity = Entity;
;
