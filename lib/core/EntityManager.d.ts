import { Entity } from './Entity';
import { SystemLookup } from './Process/Process';
export interface IEntity {
    new (...args: Array<any>): Entity;
}
export declare class EntityManager {
    private systemMap;
    readonly globals: {
        [key: string]: any;
    };
    constructor(systemMap: SystemLookup<string | number>, globals: {
        [key: string]: any;
    });
    /**
     * decorates the entity with hooks for system onRemove and onAdded;
     * @param entity
     * @param data - any additional data you may want to use to initialize the entity inside of the system hooks
     */
    initializeEntity(entity: Entity, data?: any): Entity;
    destroyEntity(entity: Entity): void;
}
