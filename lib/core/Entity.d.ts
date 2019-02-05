export declare abstract class Entity {
    id: string | number;
    type: string | number;
    components: any;
    propertiesFromComponent: {
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
    addComponent(component: any): this;
    private setAttribute;
    getAttributes(): {
        [name: string]: any;
    };
    hasComponent(componentName: any): boolean;
    removeComponent(componentName: any): void;
}
