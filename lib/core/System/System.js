"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class System {
    constructor(name) {
        this.globals = {};
        if (!name && name !== 0) {
            throw 'Systems must be created with a valid name passed into the super constructor call.';
        }
        this.name = name;
    }
    onRemoteMessage(message) { }
    ;
    _onInit() {
        this.dispatchLocal = this.messageQueue.add.bind(this.messageQueue);
        this.dispatchAllLocal = this.messageQueue.addAll.bind(this.messageQueue);
        this.dispatchLocalInstant = this.messageQueue.instantDispatch.bind(this.messageQueue);
        this.dispatchAllLocalInstant = this.messageQueue.instantDispatchAll.bind(this.messageQueue);
        this.onInit();
    }
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
