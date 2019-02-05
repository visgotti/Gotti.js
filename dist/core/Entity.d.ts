export declare abstract class Entity {
    id: string;
    type: string;
    components: any;
    functionsFromComponent: any;
    constructor(id: any, type: any);
    onMessage(message: any): void;
    /**
     * Adds the component to an Entity, giving it all the functionality from the methods defined.
     * @param component
     * @returns {Entity}
     */
    addComponent(component: any): this;
    hasComponent(componentName: any): boolean;
    removeComponent(componentName: any): void;
}
