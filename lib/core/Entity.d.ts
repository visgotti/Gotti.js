import { Component } from './Component';
export declare abstract class Entity {
    id: string | number;
    type: string | number;
    components: any;
    componentNames: Array<string | number>;
    methodsFromComponent: {
        [componentName: string]: any;
    };
    attributes: {
        [name: string]: any;
    };
    constructor(id: any, type: any);
    abstract initialize(data?: any): void;
    /**
     * Adds the component to an Entity, giving it all the functionality from the methods defined.
     * @param component
     * @returns {Entity}
     */
    addComponent(component: Component): void;
    protected setAttribute(key: string, value: any): void;
    getComponent(componentName: any): any;
    getAttributes(): {
        [name: string]: any;
    };
    hasComponent(componentName: any): boolean;
    removeComponent(componentName: any): void;
    destroy(): void;
}
