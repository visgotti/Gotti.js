"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityManager {
    constructor(systemMap) {
        this.systemMap = systemMap;
    }
    /**
     * decorates the entity with hooks for system onRemove and onAdded;
     * @param entity
     * @param data - any additional data you may want to use to initialize the entity inside of the system hooks
     */
    initializeEntity(entity, data) {
        const oldAddComponent = entity.addComponent;
        entity.addComponent = (component) => {
            oldAddComponent.call(entity, component);
            const system = this.systemMap[component.name];
            if (system) {
                system.onEntityAddedComponent(entity, component);
                if (component.isNetworked) {
                    system.addNetworkedFunctions(component);
                }
            }
        };
        const oldRemoveComponent = entity.removeComponent;
        entity.removeComponent = (componentName) => {
            const system = this.systemMap[componentName];
            if (system) {
                system.onEntityRemovedComponent(entity, entity.getComponent(componentName));
            }
            oldRemoveComponent.call(entity, componentName);
        };
        entity.initialize(data);
        return entity;
    }
    destroyEntity(entity) {
        entity.destroy();
    }
}
exports.EntityManager = EntityManager;
