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
    set serverGameData(newData) {
        const oldServerData = Object.assign({}, this._serverGameData);
        this._serverGameData = newData;
        this.onServerDataUpdated(newData, oldServerData);
    }
    get serverGameData() {
        return this._serverGameData;
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
    //overrided in ServerSystem and ClientSystem initialize function
    initializeEntity(entity, data) { }
    ;
    destroyEntity(entity) { }
    ;
    // optional
    onEntityRemovedComponent(entity) { }
    ;
    onEntityAddedComponent(entity) { }
    ;
    onInit() { }
    ;
    onStop() { }
    ;
    onStart() { }
    ;
    onServerDataUpdated(newData, oldData) { }
}
exports.default = System;
