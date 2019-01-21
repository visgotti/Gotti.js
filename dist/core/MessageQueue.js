"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessageQueue {
    static readToSendFormat(msg) {
        return [msg.type, msg.data, msg.to, msg.from];
    }
    constructor() {
        this._systems = {};
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
    }
    removeAllSystemsAndMessages() {
        for (let systemName in this._systems) {
            delete this._systems[systemName];
            this._messages[systemName].length = 0;
            delete this._messages[systemName];
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
    }
    add(message) {
        for (let i = 0; i < message.to.length; i++) {
            this.messages[message.to[i]].push(message);
        }
    }
    ;
    addRemote(msg) {
        const message = {
            type: msg[0],
            data: msg[1],
            to: msg[2],
            from: msg[3],
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
