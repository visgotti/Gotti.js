import { Component } from './Component';
export declare abstract class Entity {
    id: string | number;
    type: string | number;
    components: any;
    methodsFromComponent: {
        [componentName: string]: any;
    };
    attributes: {
        [name: string]: any;
    };
    constructor(id: any, type: any);
    onMessage(message: any): void;
    /**
     * Adds the component to an Entity, giving it all the functionality from the methods defined.
     * @param component
     * @returns {Entity}
     */
    addComponent(component: Component): this;
    private setAttribute;
    getAttributes(): {
        [name: string]: any;
    };
    hasComponent(componentName: any): boolean;
    removeComponent(componentName: any): void;
}
