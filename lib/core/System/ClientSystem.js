"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
class ClientSystem extends System_1.default {
    constructor(name) {
        super(name);
        this.onRemoteMessage = this.onServerMessage.bind(this);
    }
    /**
     * Initialize gets called by the process and
     * populates the system with the web client, message queue, and any
     * user defined variables you want all systems to have access to.
     * The web client
     * @param client - Gotti web client
     * @param messageQueue
     * @param globalSystemVariables - map of objects or values you want to be able to access in any system in the globals property.
     */
    initialize(client, messageQueue, globalSystemVariables) {
        if (globalSystemVariables && typeof globalSystemVariables === 'object') {
            Object.keys(globalSystemVariables).forEach((referenceName) => {
                if (referenceName in this.globals) {
                    throw new Error(`Duplicate global object references: ${referenceName}`);
                }
                this.globals[referenceName] = globalSystemVariables[referenceName];
            });
        }
        this.client = client;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchToServer = client.sendSystemMessage;
        this.immediateDispatchToServer = client.sendImmediateSystemMessage;
        this.initialized = true;
        this._onInit();
    }
    addListenStatePaths(path) {
        if (Array.isArray(path)) {
            path.forEach(p => {
                // confirm its valid path maybe?
                this.client.addSystemPathListener(this, p);
            });
        }
        else {
            this.client.addSystemPathListener(this, path);
        }
    }
    ;
    //TODO: would be cool to do a runtime static code check to make sure onStateUpdate implements all listeners
    onStateUpdate(pathString, pathData, change, value) { }
    ;
}
exports.default = ClientSystem;
