"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// let SystemComponent: SystemComponentDecorator;
class Decorators {
    constructor() {
        this.SystemComponent = null;
    }
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
                target.prototype['onAdded'] = (entity) => {
                    old_onAdded(entity);
                    systems[systemName].onComponentAdded(entity);
                };
            };
        };
    }
    restore() {
        this.SystemComponent = null;
    }
}
;
const decorators = new Decorators();
exports.decorators = decorators;
