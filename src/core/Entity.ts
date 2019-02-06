export abstract class Entity {
    public id: string | number;
    public type: string | number;
    public components: any;
    public methodsFromComponent: {[componentName: string]: any };
    public attributes: {[name: string]: any} = {};

    constructor(id, type){
        // Generate a pseudo random ID
        this.id = id;
        this.type = type;

        // The component data will live in this object
        this.components = {};

        // this is a map of all the functions received from the component
        this.methodsFromComponent = {};

        return this;
    }

    onMessage(message){}

    /**
     * Adds the component to an Entity, giving it all the functionality from the methods defined.
     * @param component
     * @returns {Entity}
     */
    public addComponent(component) {
        if(this.hasComponent(component.name)) {
            throw `Entity ${this.id} trying to add ${component.name} twice `;
        }
        this.components[component.name] = component;
        this.methodsFromComponent[component.name] = component.componentMethods;

        for(var i = 0; i < component.componentMethods.length; i++) {
            let propertyName = component.componentMethods[i];
            if(this[propertyName] !== undefined){
                throw (`Duplicated property ${propertyName} names in component ${component.name} attached to an entity. Component properties must be unique`);
            }
            if(component[propertyName] instanceof Function) {
                this[propertyName] = component[propertyName].bind(component);
            }
        }

        // attach setAttribute to component
        component.setAttribute = this.setAttribute.bind(this);

        return this;
    }

    private setAttribute(key: string, value: any) {
        this.attributes[key] = value;
    }

    public getAttributes() {
        return this.attributes;
    }

    // checks if the compnentName is referenced in the entity.
    public hasComponent(componentName){
        return this.components[componentName] !== undefined;
    }

    public removeComponent(componentName){
        const component = this.components[componentName];

        if(component === undefined) {
            throw `Entity ${this.id} trying to remove non existening component ${componentName} `;
        }

        delete this.components[componentName];

        for(var i = 0; i < this.methodsFromComponent[componentName].length; i++) {
            delete this[this.methodsFromComponent[componentName][i]];
        }

        delete this.methodsFromComponent[componentName];

        component.onRemoved(this);
    }
};