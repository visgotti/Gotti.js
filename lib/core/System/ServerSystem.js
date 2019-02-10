"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const System_1 = require("./System");
class ServerSystem extends System_1.default {
    constructor(name) {
        super(name);
        this.onRemoteMessage = this.onClientMessage.bind(this);
    }
    initialize(room, messageQueue, globalSystemVariables) {
        if (globalSystemVariables && typeof globalSystemVariables === 'object') {
            Object.keys(globalSystemVariables).forEach((referenceName) => {
                if (referenceName in this.globals) {
                    throw new Error(`Duplicate global object references: ${referenceName}`);
                }
                this.globals[referenceName] = globalSystemVariables[referenceName];
            });
        }
        //  this.dispatchToClient = room.send;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchLocal = messageQueue.add;
        this.dispatchToAllClients = this.room.dispatchGlobalSystemMessage.bind(this.room);
        this.dispatchToLocalClients = this.room.dispatchLocalSystemMessage.bind(this.room);
        this.dispatchToClient = this.room.dispatchClientSystemMessage.bind(this.room);
        this.dispatchToAreas = this.room.dispatchSystemMessageToAreas.bind(this.room);
        //     this.dispatchRemote = room.relayMessageQueue;
        this.initialized = true;
        this._onInit();
    }
    dispatchToAreas(message) { }
    ;
    dispatchToClient(clientUid, message) { }
    ;
    dispatchToAllClients(message) { }
    ;
    dispatchToLocalClients(message) { }
}
exports.default = ServerSystem;
