"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerSystem_1 = require("../System/ServerSystem");
exports.GOTTI_CLIENT_MANAGER_SYSTEM_CONSTANT = 'GOTTI_CLIENT_MANAGER_SYSTEM';
class ClientManager extends ServerSystem_1.default {
    constructor(name = exports.GOTTI_CLIENT_MANAGER_SYSTEM_CONSTANT) {
        // needs to be a unique id
        super(exports.GOTTI_CLIENT_MANAGER_SYSTEM_CONSTANT);
        this._initialized = false;
    }
    get initialized() {
        return this._initialized;
    }
    set initialized(value) {
        if (this._initialized) {
            throw new Error('Client Manager was already initialized');
        }
        this._initialized = true;
    }
    onClientRequestWrite(clientId, areaId, options) {
        return true;
    }
    onClientRequestRemoveWrite(clientId, areaId, options) {
        return true;
    }
    onClientRequestListen(clientId, options) {
        return true;
    }
    onClientRequestRemoveListen(clientId, options) {
        return true;
    }
    // gets initialized by area room.
    setClientWrite(clientId, areaId, options) {
        throw 'clientManager.setClientWrite should be overidden in area initialization before use.';
    }
    ;
    removeClientListener(clientId, options) {
        throw 'removeClientListener should be overidden in area initialization before use.';
    }
    ;
}
exports.ClientManager = ClientManager;
