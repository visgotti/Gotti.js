"use strict";
//TODO: split this into server and client message queue
Object.defineProperty(exports, "__esModule", { value: true });
class ServerMessageQueue {
    constructor() {
        this._systems = {};
        this.systemNames = [];
        this._messages = {};
        this._clientMessages = {};
        this._areaMessages = {};
    }
    get systems() {
        return this._systems;
    }
    get messages() {
        return this._messages;
    }
    get clientMessages() {
        return this._clientMessages;
    }
    get areaMessages() {
        return this._areaMessages;
    }
    removeSystem(systemName) {
        this._messages[systemName].length = 0;
        delete this._messages[systemName];
        delete this._clientMessages[systemName];
        delete this._areaMessages[systemName];
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
            this._clientMessages[systemName].length = 0;
            this._areaMessages[systemName].length = 0;
            delete this._messages[systemName];
            delete this._areaMessages[systemName];
            delete this._clientMessages[systemName];
            this.systemNames.length = 0;
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
        this._clientMessages[system.name] = [];
        this._areaMessages[system.name] = [];
        this.systemNames.push(system.name);
    }
    add(message) {
        for (let i = 0; i < message.to.length; i++) {
            this._messages[message.to[i]].push(message);
        }
    }
    ;
    addClientMessage(clientId, message) {
        for (let i = 0; i < message.to.length; i++) {
            this._clientMessages[message.to[i]].push([clientId, message]);
        }
    }
    ;
    addAreaMessage(areaId, message) {
        for (let i = 0; i < message.to.length; i++) {
            this._clientMessages[message.to[i]].push([areaId, message]);
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
    instantClientDispatch(clientId, message) {
        const messageToLength = message.to.length;
        for (let i = 0; i < messageToLength; i++) {
            this._systems[message.to[i]].onClientMessage(clientId, message);
        }
    }
    instantAreaDispatch(areaId, message) {
        const messageToLength = message.to.length;
        for (let i = 0; i < messageToLength; i++) {
            this._systems[message.to[i]].onAreaMessage(areaId, message);
        }
    }
    /**
     * used for sending a message instantly to other systems versus waiting for next tick in the game loop.
     * @param message
     */
    instantDispatch(message) {
        const messageToLength = message.to.length;
        for (let i = 0; i < messageToLength; i++) {
            this._systems[message.to[i]].onLocalMessage(message);
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
    dispatch(systemName) {
        let i, system, msg, serverMsg;
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
        for (i = 0; this._areaMessages[systemName].length; i++) {
            serverMsg = this._areaMessages[systemName][i];
            if (serverMsg) {
                system = this._systems[systemName];
                if (system) {
                    system.onAreaMessage(serverMsg[0], serverMsg[1]);
                }
            }
            this._areaMessages[systemName].splice(i, 1);
            i--;
        }
        for (i = 0; this._clientMessages[systemName].length; i++) {
            serverMsg = this._clientMessages[systemName][i];
            if (serverMsg) {
                system = this._systems[systemName];
                if (system) {
                    system.onClientMessage(serverMsg[0], serverMsg[1]);
                }
            }
            this._clientMessages[systemName].splice(i, 1);
            i--;
        }
    }
}
exports.ServerMessageQueue = ServerMessageQueue;
