"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class System {
    onRemoteMessage(message) { }
    ;
    constructor(name) {
        if (!name && name !== 0) {
            throw 'Systems must be created with a valid name passed into the super constructor call.';
        }
        this.name = name;
    }
    _onInit() {
        this.addMessageListener = this.messageQueue.addGameSystemMessageListener.bind(this.messageQueue, this.name);
        this.dispatchLocal = this.messageQueue.add.bind(this.messageQueue);
        this.dispatchAllLocal = this.messageQueue.addAll.bind(this.messageQueue);
        this.dispatchLocalInstant = this.messageQueue.instantDispatch.bind(this.messageQueue);
        this.dispatchAllLocalInstant = this.messageQueue.instantDispatchAll.bind(this.messageQueue);
        this.onInit();
    }
    addMessageListener(messageName) {
        throw new Error('addMessageListener must be called after the systems onInit function is executed');
    }
    ;
    // optional
    onInit() { }
    ;
    onStop() { }
    ;
    onStart() { }
    ;
    onGameDataUpdate() { }
    ;
}
exports.default = System;
