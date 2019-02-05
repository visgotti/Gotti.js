"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
class ServerSystem extends System_1.default {
    constructor(name) {
        super(name);
        this.onRemoteMessage = this.onClientMessage.bind(this);
    }
    initialize(room, state, messageQueue, globalSystemVariables) {
        Object.keys(globalSystemVariables).forEach((referenceName) => {
            if (referenceName in this) {
                throw new Error(`Can not have a global object that shares a reference with native system class: ${referenceName}`);
            }
            this[referenceName] = globalSystemVariables[referenceName];
        });
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
