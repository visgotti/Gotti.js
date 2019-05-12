"use strict";
//TODO: split this into server and client message queue
Object.defineProperty(exports, "__esModule", { value: true });
class MessageQueue {
    constructor() {
        this.engineSystemMessageGameSystemHooks = {};
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
    /**
     * dispatches message to systems if there were any passed in.
     * @param type
     */
    gameSystemHook(message, listeningSystemNames) {
        // if theres any registered game systems listening for this specific type of message...
        if (listeningSystemNames) {
            const length = listeningSystemNames.length;
            for (let i = 0; i < length; i++) {
                this._messages[listeningSystemNames[length]].push(message);
            }
        }
    }
    addGameSystemMessageListener(systemName, messageType) {
        if (!(messageType in this.engineSystemMessageGameSystemHooks)) {
            this.engineSystemMessageGameSystemHooks[messageType] = [];
        }
        this.engineSystemMessageGameSystemHooks[messageType].push(systemName);
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
            if (!(message.to[i] in this._systems)) {
                console.error('trying to dispatch message', message.type, 'to a nonexistent system name', message.to[i]);
                continue;
            }
            this.messages[message.to[i]].push(message);
        }
        this.gameSystemHook(message, this.engineSystemMessageGameSystemHooks[message.type]);
    }
    ;
    addAll(message) {
        const systemsLength = this.systemNames.length;
        for (let i = 0; i < systemsLength; i++) {
            this.messages[this.systemNames[i]].push(message);
        }
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
                if (!(message.to[i] in this._systems)) {
                    console.error('trying to dispatch message', message.type, 'to a nonexistent system name', message.to[i]);
                    continue;
                }
                this._systems[message.to[i]].onRemoteMessage(message);
            }
        }
        else {
            for (let i = 0; i < messageToLength; i++) {
                if (!(message.to[i] in this._systems)) {
                    console.error('trying to dispatch message', message.type, 'to a nonexistent system name', message.to[i]);
                    continue;
                }
                this._systems[message.to[i]].onLocalMessage(message);
            }
            this.gameSystemHook(message, this.engineSystemMessageGameSystemHooks[message.type]);
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
        for (let i = 0; i < to.length; i++) {
            if (!(to[i] in this._systems)) {
                console.error('trying to dispatch message', type, 'to a nonexistent system name', to);
                continue;
            }
            this._remoteMessages[to[i]].push({ type, data, to, from });
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
