"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityManager {
    constructor(systemMap) {
        this.systemMap = systemMap;
    }
    /**
     * decorates the entity with hooks for system onRemove and onAdded;
     * @param entity
     */
    initializeEntity(entity) {
        const oldAddComponent = entity.addComponent;
        entity.addComponent = (component) => {
            oldAddComponent.call(entity, component);
            const system = this.systemMap[component.name];
            if (system) {
                system.onEntityAddedComponent(entity);
            }
        };
        const oldRemoveComponent = entity.removeComponent;
        entity.removeComponent = (componentName) => {
            oldRemoveComponent.call(entity, componentName);
            const system = this.systemMap[componentName];
            if (system) {
                system.onEntityRemovedComponent(entity);
            }
        };
        entity.initialize();
        return entity;
    }
    destroyEntity(entity) {
        entity.destroy();
    }
}
exports.EntityManager = EntityManager;
