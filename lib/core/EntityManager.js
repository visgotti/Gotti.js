"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityManager = void 0;
class EntityManager {
    constructor(systemMap, globals) {
        this.systemMap = systemMap;
        this.globals = globals;
    }
    /**
     * decorates the entity with hooks for system onRemove and onAdded;
     * @param entity
     * @param data - any additional data you may want to use to initialize the entity inside of the system hooks
     */
    initializeEntity(entity, data) {
        entity.globals = this.globals;
        const oldAddComponent = entity.addComponent;
        entity.addComponent = (component) => {
            oldAddComponent.call(entity, component);
            const system = this.systemMap[component.name];
            if (system) {
                component.$ = system.$;
                system.onEntityAddedComponent(entity, component);
            }
        };
        const oldRemoveComponent = entity.removeComponent;
        entity.removeComponent = (componentName) => {
            const system = this.systemMap[componentName];
            if (system) {
                system._onEntityRemovedComponent(entity, entity.getComponent(componentName));
            }
            oldRemoveComponent.call(entity, componentName);
        };
        entity.initialize(data);
        return entity;
    }
    destroyEntity(entity) {
        delete entity.globals;
        entity.destroy();
    }
}
exports.EntityManager = EntityManager;
