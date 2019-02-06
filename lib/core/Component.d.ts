import { Entity } from './Entity';
export declare abstract class Component {
    componentMethods: Array<string>;
    name: string | number;
    entityId: string;
    parentObject: any;
    setAttribute: Function;
    constructor(name: string | number);
    onAdded(entity: Entity): void;
    onRemoved(entity: Entity): void;
}
