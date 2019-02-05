import { Entity } from './Entity';
export declare abstract class Component {
    componentFunctions: Array<string>;
    name: string;
    entityId: string;
    constructor(name: any);
    abstract onRemoved(entity: Entity): any;
}
