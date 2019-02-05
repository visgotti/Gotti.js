import { Entity } from './Entity';
export declare abstract class Component {
    componentProperties: Array<string>;
    name: string | number;
    entityId: string;
    parentObject: any;
    setAttribute: Function;
    constructor(name: string | number);
    abstract onRemoved(entity: Entity): any;
}
