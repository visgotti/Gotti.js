import { Entity } from './Entity';

export interface Mixin {
    beforeUpdate?: (delta) => void;
    afterUpdate?: (delta) => void;

    beforeOnEntityAddedComponent?: (entity: Entity) => void;
    afterOnEntityAddedComponent?: (entity: Entity) => void;

    beforeOnEntityRemovedComponent?: (entity: Entity) => void;
    afterOnEntityRemovedComponent?: (entity: Entity) => void;

    beforeOnInit?: () => void;
    afterOnInit?: () => void;

    beforeStart?: () => void;
    afterStart?: () => void;

    beforeStop?: () => void;
    afterStop?: () => void;

    methods?: {[methodName: string]: Function }
    props?: {[propName: string]: any}
}