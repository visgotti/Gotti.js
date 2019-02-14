"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// let SystemComponent: SystemComponentDecorator;
class Decorators {
    constructor() { }
    ;
    initializeSystemComponentDecorator(systems) {
        this.SystemComponent = function (systemName) {
            return (target) => {
                if (!(target.prototype['onRemoved'] && target.prototype['onAdded'] && systems[systemName])) {
                    return target;
                }
                const old_onRemoved = target.prototype['onRemoved'].bind(target.prototype);
                const old_onAdded = target.prototype['onRemoved'].bind(target.prototype);
                target.prototype['onRemoved'] = (entity) => {
                    old_onRemoved(entity);
                    systems[systemName].onComponentRemoved(entity);
                };
                console.log('decorating..');
                target.prototype['onAdded'] = (entity) => {
                    old_onAdded(entity);
                    console.log('decorated system name:', systemName, 'for entity', entity);
                    systems[systemName].onComponentAdded(entity);
                };
            };
        };
    }
    SystemComponent(systemName) { }
    ;
    restore() {
        this.SystemComponent = null;
    }
}
;
const decorators = new Decorators();
exports.decorators = decorators;
