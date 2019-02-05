import { Entity } from './Entity';
export declare abstract class ServerEntity extends Entity {
    id: string;
    type: string;
    components: any;
    functionsFromComponent: any;
    attributes: any;
    constructor(id: any, type: any);
    setAttribute(property: any, value: any): void;
    getEncodedAttributes(): string;
}
