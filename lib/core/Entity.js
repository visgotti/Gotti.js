"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Entity {
    constructor(id, type) {
        this.attributes = {};
        // Generate a pseudo random ID
        this.id = id;
        this.type = type;
        // The component data will live in this object
        this.components = {};
        // this is a map of all the functions received from the component
        this.propertiesFromComponent = {};
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
        this.propertiesFromComponent[component.name] = component.componentProperties;
        for (var i = 0; i < component.componentProperties.length; i++) {
            let propertyName = component.componentProperties[i];
            if (this[propertyName] !== undefined) {
                throw (`Duplicated property ${propertyName} names in component ${component.name} attached to an entity. Component properties must be unique`);
            }
            if (component[propertyName] instanceof Function) {
                this[propertyName] = component[propertyName].bind(component);
            }
            else {
                this[propertyName] = component[propertyName];
            }
        }
        // attach setAttribute to component
        component.setAttribute = this.setAttribute.bind(this);
        return this;
    }
    setAttribute(key, value) {
        this.attributes[key] = value;
    }
    getAttributes() {
        return this.attributes;
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
        for (var i = 0; i < this.propertiesFromComponent[componentName].length; i++) {
            delete this[this.propertiesFromComponent[componentName][i]];
        }
        delete this.propertiesFromComponent[componentName];
        component.onRemoved(this);
    }
}
exports.Entity = Entity;
;
