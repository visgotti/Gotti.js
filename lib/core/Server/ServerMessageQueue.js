"use strict";
//TODO: split this into server and client message queue
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMessageQueue = void 0;
class ServerMessageQueue {
    constructor() {
        this.engineSystemMessageGameSystemHooks = {};
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
    /**
     * dispatches message to systems if there were any passed in.
     * @param type
     */
    gameSystemHook(message, listeningSystemNames) {
        // if theres any registered game systems listening for this specific type of message...
        if (listeningSystemNames) {
            const length = listeningSystemNames.length;
            for (let i = 0; i < length; i++) {
                this._messages[listeningSystemNames[i]].push(message);
            }
        }
    }
    addGameSystemMessageListener(systemName, messageType) {
        if (!(messageType in this.engineSystemMessageGameSystemHooks)) {
            this.engineSystemMessageGameSystemHooks[messageType] = [];
        }
        // dont allow duplicate hooks from the same system so do a check
        // addGameSystemMessageListener shouldnt be called really outside of the onInit
        // or very infrequently, so the loop shouldnt hinder performance anywhere.
        let length = this.engineSystemMessageGameSystemHooks[messageType];
        while (length--) {
            if (this.engineSystemMessageGameSystemHooks[messageType][length] === systemName) {
                throw new Error(`Duplicate message: ${messageType} listener for system: ${systemName} `);
            }
        }
        this.engineSystemMessageGameSystemHooks[messageType].push(systemName);
    }
    removeGameSystemMessageListener(systemName, messageType) {
        if (!(messageType in this.engineSystemMessageGameSystemHooks)) {
            throw new Error(`Trying to remove a message listener: ${messageType}   but the message was never listened to by any system`);
        }
        else {
            let length = this.engineSystemMessageGameSystemHooks[messageType].length;
            while (length--) {
                if (this.engineSystemMessageGameSystemHooks[messageType][length] === systemName) {
                    this.engineSystemMessageGameSystemHooks[messageType].splice(length, 1);
                    if (this.engineSystemMessageGameSystemHooks[messageType].length === 0) {
                        delete this.engineSystemMessageGameSystemHooks[messageType];
                    }
                    return true;
                }
            }
            // if it gets here it didnt find the system for the message
            throw new Error(`Trying to remove message: ${messageType} listener but the system never listened to it.`);
        }
    }
    removeSystem(systemName) {
        // remove all message listeners from that system if there are any
        // its a bit redundant but systems shouldnt be removed/added quickly anyway so doesnt
        // need to be optimized
        for (let messageType in this.engineSystemMessageGameSystemHooks) {
            try {
                this.removeGameSystemMessageListener(systemName, messageType); // we know this may throw an error if the system wasnt listening to anything so its okay
            }
            catch (err) { }
        }
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
        if (system.name in this._systems) {
            throw new Error(`Already added system ${system.name} to message queue.`);
        }
        this._systems[system.name] = system;
        this._messages[system.name] = [];
        this._clientMessages[system.name] = [];
        this._areaMessages[system.name] = [];
        this.systemNames.push(system.name);
    }
    add(message) {
        for (let i = 0; i < message.to.length; i++) {
            if (!(message.to[i] in this._systems)) {
                console.warn('trying to dispatch message', message.type, 'to a nonexistent system name', message.to[i]);
                continue;
            }
            this._messages[message.to[i]].push(message);
        }
        this.gameSystemHook(message, this.engineSystemMessageGameSystemHooks[message.type]);
    }
    addClientMessage(clientId, message) {
        if (Array.isArray(message === null || message === void 0 ? void 0 : message.to)) {
            for (let i = 0; i < message.to.length; i++) {
                if (!(message.to[i] in this._systems)) {
                    console.warn('trying to dispatch client message:', message.type, 'to a nonexistent system name', message.to[i]);
                    continue;
                }
                this._clientMessages[message.to[i]].push([clientId, message]);
            }
        }
    }
    ;
    addAreaMessage(areaId, message) {
        for (let i = 0; i < message.to.length; i++) {
            if (!(message.to[i] in this._systems)) {
                console.warn('received area message from area:', areaId, 'which is trying to dispatch message:', message.type, 'to a nonexistent system:', message.to[i]);
                continue;
            }
            this._areaMessages[message.to[i]].push([areaId, message]);
        }
    }
    ;
    /**
     * Adds message to every system even if they dont have a registered handler //TODO: possible inclusion/exclusion options in system
     */
    addAll(message) {
        const systemsLength = this.systemNames.length;
        for (let i = 0; i < systemsLength; i++) {
            this.messages[this.systemNames[i]].push(message);
        }
    }
    ;
    instantClientDispatch(clientId, message) {
        if (Array.isArray(message === null || message === void 0 ? void 0 : message.to)) {
            const messageToLength = message.to.length;
            for (let i = 0; i < messageToLength; i++) {
                if (!(message.to[i] in this._systems)) {
                    console.error('trying to dispatch client message', message.type, 'to a nonexistent system name', message.to[i]);
                    continue;
                }
                this._systems[message.to[i]].onClientMessage(clientId, message);
            }
        }
    }
    instantAreaDispatch(areaId, message) {
        const messageToLength = message.to.length;
        for (let i = 0; i < messageToLength; i++) {
            if (!(message.to[i] in this._systems)) {
                console.warn('received area message from area:', areaId, 'which is trying to dispatch message:', message.type, 'to a nonexistent system:', message.to[i]);
                continue;
            }
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
            if (!(message.to[i] in this._systems)) {
                console.error('trying to dispatch message', message.type, 'to a nonexistent system name', message.to[i]);
                continue;
            }
            this._systems[message.to[i]].onLocalMessage(message);
        }
        this.gameSystemHook(message, this.engineSystemMessageGameSystemHooks[message.type]);
    }
    /**
     * used for sending a message instantly to all other systems
     * @param message
     */
    instantDispatchAll(message) {
        for (let i = 0; i < this.systemNames.length; i++) {
            this._systems[this.systemNames[i]].onLocalMessage({ data: message.data, type: message.type, to: [this.systemNames[i]] });
        }
    }
    addMasterMessage(message) {
        for (let i = 0; i < this.systemNames.length; i++) {
            const systemName = this.systemNames[i];
            this._systems[systemName].onMasterMessage && this._systems[systemName].onMasterMessage(message);
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
