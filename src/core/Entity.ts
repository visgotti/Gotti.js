import { Component } from './Component';

const EventEmitter = require('eventemitter3');

export abstract class Entity extends EventEmitter {
    public id: string | number;
    public type: string | number;
    public components: any;
    public componentNames: Array<string | number> = [];
    public methodsFromComponent: {[componentName: string]: any };
    public attributes: {[name: string]: any} = {};
    public attributeGetters: Array<Array<any>> = [];
    public globals : {[key: string]: any };

    constructor(id, type){
        super();
        // Generate a pseudo random ID
        this.id = id;
        this.type = type;

        // The component data will live in this object
        this.components = {};

        // this is a map of all the functions received from the component
        this.methodsFromComponent = {};

        return this;
    }

    // add components to start in here
    public abstract initialize(data?: any) : void;

    /**
     * Adds the component to an Entity, giving it all the functionality from the methods defined.
     * @param component
     * @returns {Entity}
     */
    public addComponent(component: Component) {
        if(this.hasComponent(component.name)) {
            throw `Entity ${this.id} trying to add ${component.name} twice `;
        }
        component.globals = this.globals;
        this.components[component.name] = component;
        this.methodsFromComponent[component.name] = component.componentMethods;

        for(var i = 0; i < component.componentMethods.length; i++) {
            let propertyName = component.componentMethods[i];
            if (this[propertyName] !== undefined) {
                throw (`Duplicated property ${propertyName} names in component ${component.name} attached to an entity. Component properties must be unique`);
            }
            if (component[propertyName] instanceof Function) {
                this[propertyName] = component[propertyName].bind(component);
            }
        }
        component.emit = this.emit.bind(this);
        // attach setAttribute to component
        component.setAttribute = this.setAttribute.bind(this);
        component.setAttributeGetter = this.setAttributeGetter.bind(this);
        component.removeAttribute = this.removeAttribute.bind(this);
        component.onAdded(this);
        component.entityId = this.id;
        this.componentNames.push(component.name);
    }

    protected removeAttribute(key: string) {
        delete this.attributes[key];
        for(let i = 0; i < this.attributeGetters.length; i++) {
            if(this.attributeGetters[i][0] === key) {
                this.attributeGetters.splice(i, 1);
                return;
            }
        }
    }

    protected setAttribute(key: string, value: any) {
        this.attributes[key] = value;
    }

    protected setAttributeGetter(key: string, value: Function) {
        for(let i = 0; i < this.attributeGetters.length; i++) {
            if(this.attributeGetters[i][0] === key) {
                throw new Error(`Trying to set multiple attribute getters for the same key ${key}`)
            }
        }
        this.attributeGetters.push([key, value]);
    }

    public getComponent(componentName) {
        return this.components[componentName];
    }

    public getAttributes() {
        const len = this.attributeGetters.length;
        for(let i = 0; i < len; i++) {
            const array = this.attributeGetters[i];
            this.attributes[array[0]] = array[1]();
        }
        return this.attributes;
    }


    // checks if the compnentName is referenced in the entity.
    public hasComponent(componentName){
        return this.components[componentName] !== undefined;
    }

    public removeComponent(componentName) {
        const component = this.components[componentName];

        if(component === undefined) {
            throw `Entity ${this.id} trying to remove non existening component ${componentName} `;
        }

        delete this.components[componentName];

        for(var i = 0; i < this.methodsFromComponent[componentName].length; i++) {
            delete this[this.methodsFromComponent[componentName][i]];
        }

        delete this.methodsFromComponent[componentName];

        const index = this.componentNames.indexOf(componentName);
        this.componentNames.splice(index, 1);
        component.onRemoved(this);
        delete component.globals;
    }

    public destroy() {
        for(let component in this.components) {
            this.removeComponent(component);
        }
        this.removeAllListeners();
        this.componentNames = [];
        delete this.globals;
    }
};