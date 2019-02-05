"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
class ClientSystem extends System_1.default {
    constructor(name) {
        super(name);
    }
    initialize(entityMap, gameState, messageQueue, client, interfaceManager) {
        this.dispatchToServer = client.send;
        this.client = client;
        this.entityMap = entityMap;
        this.gameState = gameState;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchLocal = messageQueue.add;
        //     this.dispatchRemote = room.relayMessageQueue;
        this.interfaceManager = interfaceManager;
        this.initialized = true;
        this.onInit();
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
    onStateUpdate(path, change, value) { }
    ;
}
exports.default = ClientSystem;
