"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerSystem_1 = require("../System/ServerSystem");
class ClientManager extends ServerSystem_1.default {
    constructor(name) {
        // needs to be a unique id
        super(name);
    }
    // gets initialized by area room.
    setClientWrite(clientId, areaId, options) {
        throw 'clientManager.setClientWrite should be overidden in area initialization before use.';
    }
    ;
    addClientListen(clientId, areaId, options) {
        throw 'clientManager.addClientListen should be overidden in area initialization before use.';
    }
    removeClientListener(clientId, options) {
        throw 'removeClientListener should be overidden in area initialization before use.';
    }
    ;
}
exports.ClientManager = ClientManager;
