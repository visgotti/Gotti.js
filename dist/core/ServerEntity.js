"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Entity_1 = require("./Entity");
class ServerEntity extends Entity_1.Entity {
    constructor(id, type) {
        super(id, type);
        this.attributes = {};
    }
    setAttribute(property, value) {
        this.attributes[property] = value;
    }
    getEncodedAttributes() {
        return JSON.stringify(this.attributes);
    }
}
exports.ServerEntity = ServerEntity;
;
