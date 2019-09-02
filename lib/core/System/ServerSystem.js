"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
class ServerSystem extends System_1.default {
    constructor(name) {
        super(name);
    }
    initialize(messageQueue, entityManager, globalSystemVariables) {
        if (globalSystemVariables && typeof globalSystemVariables === 'object') {
            this.globals = globalSystemVariables;
        }
        this.initializeEntity = entityManager.initializeEntity.bind(entityManager);
        this.destroyEntity = entityManager.destroyEntity.bind(entityManager);
        //  this.dispatchToClient = room.send;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchLocal = messageQueue.add;
        //     this.dispatchRemote = room.relayMessageQueue;
        this.initialized = true;
        this._onInit();
    }
    dispatchToAreas(message, toAreaIds) { }
    ;
    dispatchToClient(clientUid, message) { }
    ;
    dispatchToAllClients(message) { }
    ;
    dispatchToLocalClients(message) { }
    ;
    dispatchToMaster(message) { }
    ;
}
exports.default = ServerSystem;
