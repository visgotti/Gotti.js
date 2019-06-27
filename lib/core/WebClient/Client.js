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
const signals_1 = require("@gamestdio/signals");
const Connector_1 = require("./Connector");
class Client {
    constructor(url, token) {
        this.runningProcess = null;
        this.processes = {};
        this.inGate = false;
        this.stateListeners = {};
        this.systemStateHandlers = {};
        this.processMessageHandlers = {};
        this.onJoinGame = new signals_1.Signal();
        this.authenticated = false;
        this.gameTypes = [];
        this.gameRegions = [];
        this._messageQueue = null;
        this.joinedGame = false;
        this.requestId = 0;
        this.hostname = url;
        this.options = {};
        this.token = token;
        this.connector = new Connector_1.Connector();
    }
    addGameProcess(gameType, process) {
        if (gameType in this.processes) {
            throw new Error(`Duplicate named game process: ${gameType}`);
        }
        this.processes[gameType] = process;
    }
    getConnectorData(gameType, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                httpPostAsync(`${this.hostname}/gate`, this.token, { gameType, options }, (err, data) => {
                    if (err) {
                        return reject(`Error requesting game ${err}`);
                    }
                    else {
                        return resolve(data);
                    }
                });
            });
        });
    }
    startGame(gameType, fps = 60, serverGameData, gottiId, host, port) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const process = this.processes[gameType];
                if (!process) {
                    return reject('Invalid gameType');
                }
                if (serverGameData) {
                    process.serverGameData = serverGameData;
                }
                this.startGameProcess(process, fps);
                if (process.isNetworked) {
                    this.joinConnector(gottiId, `${host}:${port}`).then(joinOptions => {
                        return resolve(joinOptions);
                    });
                }
                else {
                    return resolve();
                }
            });
        });
    }
    updateServerGameData(data) {
        if (!this.runningProcess) {
            throw new Error('No process is running to update server game data.');
        }
        this.runningProcess.serverGameData = data;
    }
    stopGame() {
        if (!this.runningProcess) {
            throw new Error('No process is running to stop');
        }
        if (this.runningProcess.isNetworked) {
            this.close();
        }
        this.clearGameProcess();
    }
    startGameProcess(process, fps) {
        if (this.runningProcess !== null) {
            this.clearGameProcess();
        }
        this.runningProcess = process;
        this.runningProcess.startAllSystems();
        this.runningProcess.startLoop(fps);
    }
    clearGameProcess() {
        this.runningProcess.stopAllSystems();
        this.runningProcess.stopLoop();
        this.runningProcess = null;
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
    /**
     * can dispatch process messages from within a client system using
     * this.dispatchProcessMessage()
     */
    onProcessMessage(messageName, handler) {
        this.processMessageHandlers[messageName] = handler;
    }
    removeProcessMessage(messageName) {
        delete this.processMessageHandlers[messageName];
    }
    raiseMessage(messageName, payload) {
        this.processMessageHandlers[messageName] && this.processMessageHandlers[messageName](payload);
    }
    /**
     * When you finally join a game, you need to make one last mandatory request
     * which is to find your initial write area. This is the only time where the client
     * natively can send data directly requesting an area if you wanted. The connector server
     * class will receive the client, areaOptions, and clientOptions. There is no callback or promise
     * for this, from this point on you will communicate with the server through your Gotti systems.
     * You can either implement the onAreaWrite method in your systems or you can have a server system
     * send a custom system message to one of your client systems.
     * @param clientOptions - options to send to connector when getting initial area.
     */
    writeInitialArea(clientOptions) {
        console.log('joining initial area... please register the onAreaWrite in one of your systems to handle the callback.');
        if (!this.runningProcess) {
            throw new Error('There is no currently running networked process.');
        }
        if (!this.runningProcess.isNetworked) {
            throw new Error('The current running process is not networked, there is no area to write to.');
        }
        if (!this.joinedGame) {
            throw new Error('Make sure client.startGame\'s promise resolved when called with gotti credentials in parameters');
        }
        this.connector.joinInitialArea(clientOptions);
    }
    joinConnector(gottiId, connectorURL) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield this.connector.connect(gottiId, connectorURL, this.runningProcess);
            this.joinedGame = true;
            return options;
        });
    }
    close() {
        this.joinedGame = false;
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
     */
    sendSystemMessage(message, limitEvery) {
        this.connector.sendSystemMessage(message);
    }
    /**
     * sends message over network to server
     * @param message - system message to be processed on server
     */
    sendImmediateSystemMessage(message) {
        this.connector.sendImmediateSystemMessage(message);
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
