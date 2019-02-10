"use strict";
//TODO: split this into server and client message queue
Object.defineProperty(exports, "__esModule", { value: true });
class MessageQueue {
    constructor() {
        this._systems = {};
        this.systemNames = [];
        this._messages = {};
        this._remoteMessages = {};
    }
    get systems() {
        return this._systems;
    }
    get messages() {
        return this._messages;
    }
    get remoteMessages() {
        return this._remoteMessages;
    }
    removeSystem(systemName) {
        this._messages[systemName].length = 0;
        delete this._messages[systemName];
        delete this._systems[systemName];
        const index = this.systemNames.indexOf(systemName);
        if (index >= 0) {
            this.systemNames.splice(index, 1);
        }
    }
    removeAllSystemsAndMessages() {
        for (let systemName in this._systems) {
            delete this._systems[systemName];
            this._messages[systemName].length = 0;
            delete this._messages[systemName];
            this.systemNames.length = 0;
            this._remoteMessages[systemName].length = 0;
            delete this._remoteMessages[systemName];
        }
    }
    removeAllMessages() {
        for (let systemName in this._systems) {
            this._messages[systemName].length = 0;
        }
    }
    addSystem(system) {
        this._systems[system.name] = system;
        this._messages[system.name] = [];
        this._remoteMessages[system.name] = [];
        this.systemNames.push(system.name);
    }
    add(message) {
        for (let i = 0; i < message.to.length; i++) {
            this.messages[message.to[i]].push(message);
        }
    }
    ;
    /**
     * Adds message to every system even if they dont have a registered handler //TODO: possible inclusion/exclusion options in system
     * @param type
     * @param data
     * @param from
     */
    addAll(type, data, from) {
        this.add({
            type,
            data,
            to: this.systemNames,
            from,
        });
    }
    ;
    /**
     * used for sending a message instantly to other systems versus waiting for next tick in the game loop.
     * @param message
     */
    instantDispatch(message, isRemoteMessage = false) {
        const messageToLength = message.to.length;
        if (isRemoteMessage) {
            for (let i = 0; i < messageToLength; i++) {
                this._systems[message.to[i]].onRemoteMessage(message);
            }
        }
        else {
            for (let i = 0; i < messageToLength; i++) {
                this._systems[message.to[i]].onLocalMessage(message);
            }
        }
    }
    /**
     * used for sending a message instantly to all other systems
     * @param message
     */
    instantDispatchAll(type, data, from) {
        for (let i = 0; i < this.systemNames.length; i++) {
            this._systems[this.systemNames[i]].onLocalMessage({ type, data, to: [this.systemNames[i]], from });
        }
    }
    /**
     * Queues message to be handled in either the onClientMessage handler or onServerMessage system handler
     */
    addRemote(type, data, to, from) {
        const message = {
            type,
            data,
            to,
            from,
        };
        for (let i = 0; i < message.to.length; i++) {
            this._remoteMessages[message.to[i]].push(message);
        }
    }
    dispatch(systemName) {
        let i, system, msg;
        for (i = 0; this._messages[systemName].length; i++) {
            msg = this._messages[systemName][i];
            if (msg) {
                system = this._systems[systemName];
                if (system) {
                    system.onLocalMessage(msg);
                }
            }
            this._messages[systemName].splice(i, 1);
            i--;
        }
        for (i = 0; this._remoteMessages[systemName].length; i++) {
            msg = this._remoteMessages[systemName][i];
            if (msg) {
                system = this._systems[systemName];
                if (system) {
                    system.onRemoteMessage(msg);
                }
            }
            this._remoteMessages[systemName].splice(i, 1);
            i--;
        }
    }
}
exports.MessageQueue = MessageQueue;
