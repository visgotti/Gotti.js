"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedSystem = void 0;
const System_1 = require("./System");
/**
 * Shared system is an isolated system from remote communications.
 * If you need a system that runs independently from needed server functionality
 * and is meant to be ran on both server and client, then this can accomplish that
 * while also dispatching local messages.
 */
class SharedSystem extends System_1.default {
    constructor(name) {
        super(name);
        this.dispatch = Function;
        this.dispatch = this.dispatchLocal.bind(this);
        this.onMessage = this.onRemoteMessage.bind(this);
    }
    //TODO: would be cool to do a runtime code check to make sure onStateUpdate implements all listeners
    onStateUpdate(path, change, value) { }
    ;
}
exports.SharedSystem = SharedSystem;
