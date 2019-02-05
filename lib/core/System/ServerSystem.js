"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
class ServerSystem extends System_1.default {
    constructor(name) {
        super(name);
        this.onRemoteMessage = this.onClientMessage.bind(this);
    }
    initialize(room, state, messageQueue, globalSystemVariables) {
        if (globalSystemVariables && typeof globalSystemVariables === 'object') {
            Object.keys(globalSystemVariables).forEach((referenceName) => {
                if (referenceName in this.globals) {
                    throw new Error(`Duplicate global object references: ${referenceName}`);
                }
                this.globals[referenceName] = globalSystemVariables[referenceName];
            });
        }
        //  this.dispatchToClient = room.send;
        this.state = state;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchLocal = messageQueue.add;
        //     this.dispatchRemote = room.relayMessageQueue;
        this.initialized = true;
        this._onInit();
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
