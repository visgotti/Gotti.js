"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerSystem_1 = require("../System/ServerSystem");
class ClientManager extends ServerSystem_1.default {
    constructor(name) {
        // needs to be a unique id
        super(name);
    }
    // gets initialized in GottiColyseys AreaRoom constructor.
    // see https://github.com/visgotti/GottiColyseus/blob/master/src/AreaRoom.ts
    // I know this isn't the neatest way to decorate the system and i'll refactor it eventually but it is stable.
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
    addClientListen(clientId, areaId, options) {
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
exports.ClientManager = ClientManager;
