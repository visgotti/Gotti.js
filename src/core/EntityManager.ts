import { Entity } from './Entity';
import { Component} from './Component';
import { SystemLookup } from './Process/Process';
import ClientSystem from "./System/ClientSystem";
import ServerSystem from "./System/ServerSystem";

export interface IEntity {
    new (...args: Array<any>): Entity
}

export class EntityManager {
    private systemMap: SystemLookup<string | number>;
    constructor(systemMap: SystemLookup<string | number>) {
        this.systemMap = systemMap;
    }

    /**
     * decorates the entity with hooks for system onRemove and onAdded;
     * @param entity
     * @param data - any additional data you may want to use to initialize the entity inside of the system hooks
     */
    public initializeEntity(entity: Entity, data?: any) {
        const oldAddComponent = entity.addComponent;
        entity.addComponent = (component: Component) => {
            oldAddComponent.call(entity, component);
            const system = this.systemMap[component.name];
            if(system) {
                system.onEntityAddedComponent(entity, component);
            }
        };

        const oldRemoveComponent = entity.removeComponent;
        entity.removeComponent = (componentName: string) => {
            const system = this.systemMap[componentName];
            if(system) {
                system.onEntityRemovedComponent(entity, entity.getComponent(componentName));
            }
            oldRemoveComponent.call(entity, componentName);
        };
        entity.initialize(data);
        return entity;
    }

    public destroyEntity(entity: Entity) {
        entity.destroy();
    }
}