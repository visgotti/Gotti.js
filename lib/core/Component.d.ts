import { Entity } from './Entity';
import { SystemPlug } from './System/System';
export declare abstract class Component {
    componentMethods: Array<string>;
    name: string | number;
    setAttribute: Function;
    setAttributeGetter: Function;
    removeAttribute: Function;
    entityId: string | number;
    globals: {
        [key: string]: any;
    };
    $: SystemPlug;
    constructor(name: string | number);
    emit(event: string, payload: any): void;
    onAdded(entity: Entity): void;
    onRemoved(entity: Entity): void;
}
