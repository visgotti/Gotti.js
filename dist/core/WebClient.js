"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WebClient {
    constructor(connectionPath) {
        this.inGate = false;
        this.stateListeners = {};
        this.systemStateHandlers = {};
        //  this.room = new this.join()
    }
    /**
     * Gate
     * @param gateId
     * @param options
     */
    joinGate(options) {
    }
    onMessage(message) {
        /*
        if(message[0].GATE_JOINED) {
        } else if (message[0] === Protocols.JOIN_CONNECTOR) {
            this.joinConnector(message[1], message[2]); //port, token
        } else if (message[0].SYSTEM_MESSAGE) {
            this.process.messageQueue.addRemote(message[1], message[2], message[3], message[4]);
        };
        */
    }
    joinConnector(port, token) {
        // this.connect(port);
    }
    /**
     * sends message over network to server
     * @param message - system message to be processed on server
     * @param limitEvery - optional
     */
    send(message, limitEvery) {
        // this.room.send([ Protocols.CLIENT_SYSTEM_MESSAGE, message ]);
    }
    joinRoom(roomId, options) {
        /*
        this.room = this.join(roomId, options);
        this.room.onConnected(() => {
            this.process = new Process(options);
            this.process.messageQueue.addRemote = this.onServerSystemMessage.bind(this);
        });
        */
    }
    /**
     * Sends a request to the server to start listening for messages and state updates from an area.
     * @param areaId - area Id requesting to start listening to
     * @param options - options that get passed to the area room
     */
    listenArea(areaId, options) {
        //  this.room.send([Protocols.ADD_AREA_LISTEN, options]);
    }
    /**
     * Sends a request to the server to stop listening for messages and state updates from an area.
     * @param areaId
     * @param options
     */
    removeListenArea(areaId, options) {
        //   this.room.send([Protocols.REMOVE_AREA_LISTEN, options]);
    }
    /**
     * Sends a request to the server to join an area, this doesnt change your listening status,
     * but it will cause the joined area to be your 'main' area and will be the area that processes
     * any messages the client sends with sendLocal.
     * @param areaId
     * @param options
     */
    joinArea(areaId, options) {
        //   this.room.send([Protocols.CHANGE_AREA_WRITE, options]);
    }
    /**
     * Fired off when we receive a server message containing the system message protocol, will dispatch into the message queue.
     * @param message
     */
    onServerSystemMessage(message) { }
    ;
    /**
     * Adds the system's onStateChange handler to be fired off for specific state path update
     * @param system
     * @param path
     */
    addSystemPathListener(system, path) {
        // adds system to state handlers if not already in it
        if (!(system.name in this.systemStateHandlers)) {
            this.initializeSystemStateHandler(system);
        }
        if (this.systemStateHandlers[system.name].paths.indexOf(path) > -1) {
            throw `Trying to listen to duplicate path ${path} for system ${system.name}`;
        }
        if (!(path in this.stateListeners)) {
            this.stateListeners[path] = [];
        }
        this.stateListeners[path].push[system.name];
    }
    /**
     * Removes a system's onStateChange handler from a specific path.
     * @param systemName
     * @param path
     */
    removeSystemPathListener(systemName, path) {
        const listeners = this.stateListeners[path];
        if (!listeners.length)
            throw `There was no listeners for path ${path} when trying to remove from ${systemName}`;
        const index = listeners.indexOf(systemName);
        if (index < 0)
            throw `${systemName} was not listening to path ${path} could not remove a listener.`;
        listeners.splice(index, 1);
        // finally remove the path from systemStateHandlers
        this.systemStateHandlers[systemName].paths.splice(this.systemStateHandlers[systemName].paths.indexOf(path), 1);
    }
    /**
     * removes a system's onStateChange handler from any paths it was listening on.
     * gets called when you stop a system.
     * @param systemName
     */
    removeSystemHandler(systemName) {
        if (this.systemStateHandlers[systemName] !== undefined) {
            let listeningPaths = this.systemStateHandlers[systemName].paths;
            delete this.systemStateHandlers[systemName];
            for (let i = 0; i < listeningPaths.length; i++) {
                //TODO: can maybe make this more efficient since we know were removing all paths
                this.removeSystemPathListener(systemName, listeningPaths[i]);
            }
        }
    }
    /**
     * puts system into lookup if it's going to be handling state updates.
     * @param system
     */
    initializeSystemStateHandler(system) {
        this.systemStateHandlers[system.name] = {
            handler: system.onStateUpdate.bind(system),
            paths: [],
        };
    }
}
exports.WebClient = WebClient;
