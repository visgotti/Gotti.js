import { Entity } from './Entity';
export declare abstract class Component {
    componentMethods: Array<string>;
    name: string | number;
    setAttribute: Function;
    setAttributeGetter: Function;
    entityId: string | number;
    constructor(name: string | number);
    onAdded(entity: Entity): void;
    onRemoved(entity: Entity): void;
}
