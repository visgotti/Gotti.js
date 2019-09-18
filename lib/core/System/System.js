"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class System {
    constructor(name) {
        this.$ = {};
        if (!name && name !== 0) {
            throw 'Systems must be created with a valid name passed into the super constructor call.';
        }
        this.name = name;
    }
    onRemoteMessage(message) { }
    ;
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
        this.removeMessageListener = this.messageQueue.removeGameSystemMessageListener.bind(this.messageQueue, this.name);
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
    removeMessageListener(messageName) {
        throw new Error('removeMessageListener must be called after the systems onInit function is executed');
    }
    ;
    getSystemComponent(entity) {
        return entity.getComponent(this.name);
    }
    //overrided in ServerSystem and ClientSystem initialize function
    initializeEntity(entity, data) { }
    ;
    destroyEntity(entity) { }
    ;
    // optional
    /**
     * triggered when we remove a component from an entity
     * also triggered on destroyEntity MUST destroy entity with this.destroyEntity
     * @param entity - entity we removed component from
     * @param component - component we removed from entity
     */
    onEntityRemovedComponent(entity, component) { }
    ;
    /**
     * triggered whenever we add a component to an entity
     * MUST initialize entity with this.initializeEntity
     * @param entity - entity we added component to
     * @param component - component we added to entity
     */
    onEntityAddedComponent(entity, component) { }
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
