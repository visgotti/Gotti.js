"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
class ServerSystem extends System_1.default {
    constructor(name) {
        super(name);
    }
    initialize(entityMap, gameState, messageQueue, room, interfaceManager) {
        //  this.dispatchToClient = room.send;
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
    dispatchToArea(areaId, message) { }
    ;
    dispatchAllAreas(message) { }
    ;
    dispatchToClient(clientUid, message) { }
    ;
    dispatchToAllClients(message) { }
    ;
}
exports.default = ServerSystem;
