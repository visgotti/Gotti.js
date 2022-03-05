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
    /**
     * Sets a client to write to a specific area.
     * @param clientId - id of client to set
     * @param areaId - id of area the client will be writing to
     * @param options - options that get sent to the new area's ClientManager's onClientWrite
     */
    setClientWrite(clientId, areaId, options) {
        throw 'clientManager.setClientWrite should be overidden in area initialization before use.';
    }
    ;
    /**
     * Adds an area to the client to listen to.
     * @param clientId - client to add listener to
     * @param areaId - id of area that the client is listening to
     * @param options - options that get sent to the new area's ClientManager's onClientListen
     */
    addClientListener(clientId, areaId, options) {
        throw 'clientManager.addClientListen should be overidden in area initialization before use.';
    }
    ;
    /**
     * Removes client from its own listeners
     * @param clientId
     * @param options
     */
    removeClientListener(clientId, options) {
        throw 'removeClientListener should be overidden in area initialization before use.';
    }
    ;
}
exports.default = ServerSystem;
