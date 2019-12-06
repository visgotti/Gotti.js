import { Component } from './Component';
declare const EventEmitter: any;
export declare abstract class Entity extends EventEmitter {
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
    attributeGetters: Array<Array<any>>;
    constructor(id: any, type: any);
    abstract initialize(data?: any): void;
    /**
     * Adds the component to an Entity, giving it all the functionality from the methods defined.
     * @param component
     * @returns {Entity}
     */
    addComponent(component: Component): void;
    protected setAttribute(key: string, value: any): void;
    protected setAttributeGetter(key: string, value: Function): void;
    getComponent(componentName: any): any;
    getAttributes(): {
        [name: string]: any;
    };
    hasComponent(componentName: any): boolean;
    removeComponent(componentName: any): void;
    destroy(): void;
}
export {};
