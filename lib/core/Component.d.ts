import { Entity } from './Entity';
export declare abstract class Component {
    componentMethods: Array<string>;
    name: string | number;
    setAttribute: Function;
    setAttributeGetter: Function;
    isNetworked: boolean;
    sendRemote: Function;
    sendRemoteImmediate: Function;
    broadcastRemote: Function;
    onRemote: Function;
    entityId: string | number;
    constructor(name: string | number, isNetworked?: boolean);
    onAdded(entity: Entity): void;
    onRemoved(entity: Entity): void;
}
