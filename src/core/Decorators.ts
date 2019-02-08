import System from './System/System';
import { Entity } from './Entity';
import { Component } from './Component';
/**
 * Returns a function that will map the systems onComponentAdded and onComponentRemoved functions to a component
 * to be triggered when its added or removed from an entity.
 * @param systems
 */

type SystemComponentDecorator = (systemName: string | number) => any;
// let SystemComponent: SystemComponentDecorator;

class Decorators {
    constructor(){};
    public initializeSystemComponentDecorator(systems) {
        this.SystemComponent = function(systemName: string | number) {
            return (target) => {
                if(!(target.prototype['onRemoved'] && target.prototype['onAdded'] && systems[systemName])) {
                    return target;
                }

                const old_onRemoved = target.prototype['onRemoved'].bind(target.prototype);
                const old_onAdded = target.prototype['onRemoved'].bind(target.prototype);

                target.prototype['onRemoved']  = (entity: Entity) => {
                    old_onRemoved(entity);
                    systems[systemName].onComponentRemoved(entity);
                };

                target.prototype['onAdded']  = (entity) => {
                    old_onAdded(entity);
                    systems[systemName].onComponentAdded(entity);
                }
            }
        }
    }
    public SystemComponent: SystemComponentDecorator = null;

    public restore() {
        this.SystemComponent = null;
    }
};

const decorators = new Decorators();
export { decorators };
