import { Entity } from './Entity';

export abstract class ServerEntity extends Entity  {
    public id: string;
    public type: string;
    public components: any;
    public functionsFromComponent: any;

    public attributes: any;

    constructor(id, type){
        super(id, type);
        this.attributes = {};
    }

    public setAttribute(property, value) {
        this.attributes[property] = value;
    }

    public getEncodedAttributes() {
        return JSON.stringify(this.attributes);
    }
};