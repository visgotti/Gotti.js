"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Connector_1 = require("./Connector");
class Client {
    constructor(url, token) {
        this.inGate = false;
        this.stateListeners = {};
        this.systemStateHandlers = {};
        this.authenticated = false;
        this.gameTypes = [];
        this.gameRegions = [];
        this._messageQueue = null;
        this.requestId = 0;
        this.hostname = url;
        this.options = {};
        this.token = token;
        this.connector = new Connector_1.Connector();
    }
    set messageQueue(value) {
        this._messageQueue = value;
        this.connector.messageQueue = value;
    }
    getGateData() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                httpGetAsync(`${this.hostname}/gate`, this.token, (err, data) => {
                    if (err) {
                        return reject(`Error getting gate data ${err}`);
                    }
                    //   this.gameTypes = data.gameTypes;
                    //     this.gameRegions = data.gameRegions;
                    return resolve(data);
                });
            });
        });
    }
    requestGame(gameType) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                httpPostAsync(`${this.hostname}/gate`, this.token, { gameType }, (err, data) => {
                    if (err) {
                        return reject(`Error requesting game ${err}`);
                    }
                    else {
                        this.connector = new Connector_1.Connector();
                        return resolve(data);
                    }
                });
            });
        });
    }
    joinConnector(gottiId, connectorURL) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield this.connector.connect(gottiId, connectorURL);
            return options;
        });
    }
    close() {
        this.connector.connection.close();
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
exports.Client = Client;
function httpGetAsync(url, token, callback) {
    var http = new XMLHttpRequest();
    http.open("GET", url, true); // true for asynchronous
    http.responseType = 'text';
    http.setRequestHeader('authorization', token);
    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            if (http.status == 200) {
                callback(null, JSON.parse(http.responseText));
            }
            else {
                callback(JSON.parse(http.responseText), null);
            }
        }
    };
    http.send(null);
}
function httpPostAsync(url, token, request, callback) {
    var http = new XMLHttpRequest();
    http.open('POST', url, true);
    //Send the proper header information along with the request
    http.setRequestHeader('Content-Type', 'application/json');
    http.setRequestHeader('authorization', token);
    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            if (http.status == 200) {
                callback(null, JSON.parse(http.responseText));
            }
            else {
                callback(JSON.parse(http.responseText), null);
            }
        }
    };
    http.send(JSON.stringify(request));
}
