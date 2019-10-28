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
const Protocol_1 = require("./Protocol");
const Connector_1 = require("./Connector");
class Client {
    constructor(url, disableWebRTC = false) {
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
        this.options = {
            isWebRTCSupported: window.RTCPeerConnection && window.navigator.userAgent.indexOf("Edge") < 0 && !disableWebRTC
        };
        this.connector = new Connector_1.Connector();
    }
    addGameProcess(gameType, process) {
        if (gameType in this.processes) {
            throw new Error(`Duplicate named game process: ${gameType}`);
        }
        this.processes[gameType] = process;
    }
    validateServerOpts(serverGameOpts) {
        return serverGameOpts.gottiId && serverGameOpts.hasOwnProperty('clientId') && serverGameOpts.host && serverGameOpts.port;
    }
    startGame(gameType, fps = 60, serverGameOpts, serverGameData) {
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
                    if (this.validateServerOpts(serverGameOpts)) {
                        const { gottiId, clientId, host, port } = serverGameOpts;
                        this.joinConnector(gottiId, clientId, `${host}:${port}`).then(joinOptions => {
                            process.setClientIds(gottiId, clientId);
                            return resolve(joinOptions);
                        });
                    }
                    else {
                        throw new Error('Invalid server game opts for server connection.');
                    }
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
    authenticate(options, tokenHeader) {
        return new Promise((resolve, reject) => {
            httpPostAsync(`${this.hostname}${Protocol_1.GOTTI_HTTP_ROUTES.AUTHENTICATE}`, tokenHeader, { [Protocol_1.GOTTI_AUTH_KEY]: options }, (err, data) => {
                if (err) {
                    return reject(`Error requesting game ${err}`);
                }
                else {
                    const auth = data[Protocol_1.GOTTI_AUTH_KEY];
                    const authId = data[Protocol_1.GOTTI_GATE_AUTH_ID];
                    if (authId) {
                        this.authId = authId;
                        return resolve(auth);
                    }
                    else {
                        reject(`Error from authentication server`);
                    }
                }
            });
        });
    }
    register(options, tokenHeader) {
        return new Promise((resolve, reject) => {
            httpPostAsync(`${this.hostname}${Protocol_1.GOTTI_HTTP_ROUTES.REGISTER}`, tokenHeader, { [Protocol_1.GOTTI_AUTH_KEY]: options }, (err, data) => {
                if (err) {
                    return reject(`Error requesting game ${err}`);
                }
                else {
                    const auth = data[Protocol_1.GOTTI_AUTH_KEY];
                    const authId = data[Protocol_1.GOTTI_GATE_AUTH_ID];
                    if (authId) {
                        this.authId = authId;
                        return resolve(auth);
                    }
                    else {
                        reject(`Error from authentication server`);
                    }
                }
            });
        });
    }
    getGames(clientOptions, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authId) {
                throw new Error(`You are not authenticated`);
            }
            return new Promise((resolve, reject) => {
                httpPostAsync(`${this.hostname}${Protocol_1.GOTTI_HTTP_ROUTES.GET_GAMES}`, token, {
                    [Protocol_1.GOTTI_GATE_AUTH_ID]: this.authId,
                    [Protocol_1.GOTTI_GET_GAMES_OPTIONS]: clientOptions,
                }, (err, data) => {
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
    joinGame(gameType, joinOptions, token, fps = 60) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authId) {
                throw new Error(`You are not authenticated`);
            }
            return new Promise((resolve, reject) => {
                httpPostAsync(`${this.hostname}${Protocol_1.GOTTI_HTTP_ROUTES.JOIN_GAME}`, token, {
                    gameType,
                    [Protocol_1.GOTTI_GET_GAMES_OPTIONS]: joinOptions,
                    [Protocol_1.GOTTI_GATE_AUTH_ID]: this.authId,
                }, (err, data) => {
                    if (err) {
                        return reject(`Error requesting game ${err}`);
                    }
                    else {
                        this.startGame(gameType, fps, data).then((joinOptions) => {
                            return resolve(joinOptions);
                        });
                    }
                });
            });
        });
    }
    joinInitialArea(clientOptions) {
        return __awaiter(this, void 0, void 0, function* () {
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
            return new Promise((resolve, reject) => {
                this.connector.onInitialArea.add(({ areaOptions, areaId, err }) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve({ areaOptions, areaId });
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
    joinConnector(gottiId, playerIndex, connectorURL) {
        return __awaiter(this, void 0, void 0, function* () {
            const joinOpts = { gottiId, playerIndex, connectorURL };
            const options = yield this.connector.connect(joinOpts, this.runningProcess, this.options);
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
    if (token) {
        //Send the proper header information along with the request
        http.setRequestHeader('Content-Type', 'application/json');
        http.setRequestHeader('authorization', token);
    }
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
