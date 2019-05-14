import { Entity } from './Entity';
import { SystemLookup } from './Process/Process';
export interface IEntity {
    new (...args: Array<any>): Entity;
}
export declare class EntityManager {
    private systemMap;
    constructor(systemMap: SystemLookup<string | number>);
    /**
     * decorates the entity with hooks for system onRemove and onAdded;
     * @param entity
     */
    initializeEntity(entity: Entity): Entity;
    destroyEntity(entity: Entity): void;
}
