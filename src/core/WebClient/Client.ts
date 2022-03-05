type EventNames<T extends string | symbol | { [K in string | symbol]: any[] }> = T extends string | symbol ? T : keyof T;
type EventArgs<T extends string | symbol | { [K in string | symbol]: any[] }, K extends EventNames<T>> = T extends string | symbol ? any[] : K extends keyof T ? T[K] : never;

import { Signal } from '@gamestdio/signals';
import * as msgpack from './msgpack';

import { GameProcessSetup, ProcessManager } from "./ProcessManager";

import {setDefaultClientExport} from '../../index';

import { Protocol, GOTTI_GET_GAMES_OPTIONS, GOTTI_GATE_AUTH_ID, GOTTI_AUTH_KEY, GOTTI_HTTP_ROUTES, GOTTI_ROUTE_BODY_PAYLOAD } from './Protocol';
import {Connector, ConnectorAuth} from './Connector';
import ClientSystem from './../System/ClientSystem';
import { ClientMessageQueue, Message } from '../ClientMessageQueue';

export type JoinOptions = { retryTimes: number, requestId: number } & any;

import { ClientProcess } from '../Process/Client';

interface Window {
    RTCPeerConnection?: any;
    navigator?: any;
}

declare var window: Window;

export type ServerGameOptions = {
    proxyId: string,
    gottiId: string,
    clientId: number,
}

import * as EventEmitter from "eventemitter3";

export type PublicApi = {
    resetGame?: (resetData?: any) => void,
    clearGame?: () => void,
    register?: (requestPayload?: any) => Promise<any>,
    getGames?: (requestPayload?: any) => Promise<any>,
    joinInitialArea?: (requestPayload?: any) => Promise<any>
    joinGame?: (gameType: string, joinOptions: any) => Promise<{
        gameData: any,
        areaData: any
    }>
    startOfflineGame?: (gameType: string, gameData: any) => Promise<boolean>,
    onProcessMessage?: (messageName: string, handler: (any) => void) => void,
    removeProcessMessage?: (messageName) => void,
    authenticate?: (requestPayload: any) => Promise<any>,
    auth?: {[handlerName: string]: (requestPayload?: any) => Promise<any> },
    authentication?: {[handlerName: string]: (requestPayload?: any) => Promise<any> },
    gate?: {[handlerName: string]: (requestPayload?: any) => Promise<any> },
    api?: {[handlerName: string]: (requestPayload?: any) => Promise<any> },
    on: EventEmitter.ListenerFn,
    once: EventEmitter.ListenerFn,
    off: (event: any, fn?: EventEmitter.ListenerFn, context?: any, once?: boolean) => void,
    removeAllListeners: (event?: any) => void,
    emit: (event: string, payload: any) => boolean
}

type HttpRequests = { [name: string]: (requestPayload) => Promise<any> }

export class Client extends EventEmitter {
    private runningProcess: ClientProcess = null;
    private processFactories: {[gameType: string]: (gameOptions: any) => ClientProcess } = {};
    private inGate = false;
    private stateListeners : {[path: string]: Array<string>} = {};
    private systemStateHandlers: {[systemName: string]: {
        handler: Function,
        paths: Array<string>,
    };
    } = {};

    private processMessageHandlers: {[message: string]: Function} = {};

    public id?: string;

    public onJoinGame: Signal = new Signal();

    public authenticated: boolean = false;
    public options: any;
    public gameTypes: Array<string> = [];
    public gameRegions: Array<string> = [];

    private _messageQueue: ClientMessageQueue = null;

    private joinedGame = false;

    protected connector: Connector;

    protected requestId = 0;

    protected hostname: string;
    private port: number;
    private baseHttpUrl;

    private token: string;

    readonly publicApi: PublicApi;

    private auth: HttpRequests = {};
    private gate: HttpRequests = {};
    private api: HttpRequests = {};
    private authId: string;

    private processManager: ProcessManager;
    private webProtocol: string = 'http';
    private webSocketProtocol: string = 'ws:';

    constructor(gameProcessSetups: Array<GameProcessSetup>, hostname?: string, disableWebRTC=false, webProtocol?: string, port?: number) {
        super();
        if(webProtocol){
            this.webProtocol = webProtocol;
        }
        if(hostname) {
            this.hostname = hostname;
        } else if(typeof window !== "undefined" && !!window) {
            this.hostname = window['location'].hostname
        } else {
            throw new Error('No hostname provided or no window reference');
        }
        if(port) {
            this.port = port;
        } else if(typeof window !== "undefined" && !!window && window['location'] && window['location']['port']) {
            this.port = window['location'].port
        } else {
            this.port = 80;
        }
        if(!this.port) {
            this.port = 80;
        }
        this.baseHttpUrl = this.port != 80 ? `${this.hostname}:${this.port}` : this.hostname;

        if(webProtocol) {
            if(webProtocol !== 'http' && webProtocol !== 'https') {
                throw new Error('Web protocol must be http or https');
            }
            this.webProtocol = webProtocol + ':';
        } else if(typeof window !== "undefined" && !!window) {
            this.webProtocol = window['location'].protocol
        }
        if(this.webProtocol === 'https:') {
            this.webSocketProtocol = 'wss:'
        }

        this.processManager = new ProcessManager(gameProcessSetups, this);
        this.options = {
            isWebRTCSupported: window.RTCPeerConnection && window.navigator.userAgent.indexOf("Edge") < 0 && !disableWebRTC
        };
        this.connector = new Connector();
        this.publicApi = {
            resetGame: this.resetGame.bind(this),
            clearGame: this.clearGame.bind(this),
            register: this.register.bind(this),
            getGames: this.getGames.bind(this),
            joinInitialArea: this.joinInitialArea.bind(this),
            joinGame: this.joinGame.bind(this),
            onProcessMessage: this.onProcessMessage.bind(this),
            removeProcessMessage: this.removeProcessMessage.bind(this),
            authenticate: this.authenticate.bind(this),
            auth: this.auth,
            authentication: this.auth,
            gate: this.gate,
            api: this.api,
            on: this.on.bind(this),
            once: this.once.bind(this),
            emit: this.emit.bind(this),
            off: this.off.bind(this),
            removeAllListeners: this.removeAllListeners.bind(this),
            startOfflineGame: this.startOfflineGame.bind(this),
        } as PublicApi;

        setDefaultClientExport(this);
    }

    public addAuthRoutes(names) {
        names.forEach(name => {
            if(name === GOTTI_HTTP_ROUTES.AUTHENTICATE || name === GOTTI_HTTP_ROUTES.REGISTER) {
                throw new Error('auth route name in use')
            }
            const reserved = ['data', 'id'];
            if(reserved.includes(name)) {
                throw new Error(`${name} is a reserved field on auth object. cannot have handler with the name ${name}`);
            }
            this.auth[name] = async (requestPayload: any) => {
                return new Promise((resolve, reject) => {
                    httpPostAsync(`${this.webProtocol}//${this.baseHttpUrl}${GOTTI_HTTP_ROUTES.BASE_AUTH}/${name}`, '', {
                        [GOTTI_ROUTE_BODY_PAYLOAD]: requestPayload,
                        [GOTTI_GATE_AUTH_ID]: this.authId,
                    }, (err, data) => {
                        if (err) {
                            return reject(err);
                        } else {
                            console.log('data was', data);
                            const payload = data[GOTTI_ROUTE_BODY_PAYLOAD];
                            const newAuthData = data[GOTTI_AUTH_KEY];
                            const authId = data[GOTTI_GATE_AUTH_ID];
                            this.setAuthValues(newAuthData, authId);
                            return resolve(payload);
                        }
                    });
                });
            };
            this.auth[name] = this.auth[name].bind(this);
        });
        this.auth.authenticate = this.authenticate.bind(this);
        this.auth.register = this.register.bind(this);
    }

    private removeAuthValues() {
        this.authId = null;
        this.auth.id = null;
        this.auth.data = null;
    }

    private setAuthValues(authData, authId) {
        if(authData) {
            this.auth.data = authData;
            this.emit('auth-data', authData);
        }
        if(authId) {
            this.authId = authId;
            this.auth.id = authId;
            this.emit('auth-id', authId);
        }
    }

    public addGateRoutes(names) {
        names.forEach(name => {
            if(name === GOTTI_HTTP_ROUTES.GET_GAMES || name === GOTTI_HTTP_ROUTES.JOIN_GAME) {
                throw new Error('gate route name in use')
            }
            this.gate[name] = async (requestPayload: any) => {
                return new Promise((resolve, reject) => {
                    httpPostAsync(`${this.webProtocol}//${this.baseHttpUrl}${GOTTI_HTTP_ROUTES.BASE_GATE}/${name}`, '', {
                        [GOTTI_ROUTE_BODY_PAYLOAD]: requestPayload,
                        [GOTTI_GATE_AUTH_ID]: this.authId,
                    }, (err, data) => {
                        if (err) {
                            return reject(err);
                        } else {
                            const payload = data[GOTTI_ROUTE_BODY_PAYLOAD];
                            return resolve(payload);
                        }
                    });
                });
            };
            this.gate[name] = this.gate[name].bind(this);
        });
        this.gate.getGames = this.getGames.bind(this);
        this.gate.register = this.register.bind(this);
    }

    public addApiRoutes(names) {
        names.forEach(name => {
            this.api[name] = async (requestPayload: any) => {
                return new Promise((resolve, reject) => {
                    httpPostAsync(`${this.webProtocol}//${this.baseHttpUrl}${GOTTI_HTTP_ROUTES.BASE_PUBLIC_API}/${name}`, '', {
                        [GOTTI_ROUTE_BODY_PAYLOAD]: requestPayload,
                    }, (err, data) => {
                        if (err) {
                            return reject(err);
                        } else {
                            const payload = data[GOTTI_ROUTE_BODY_PAYLOAD];
                            return resolve(payload);
                        }
                    });
                });
            };
            this.api[name] = this.api[name].bind(this);
        });
    }
    public async resetGame(data?: any) {
        if(this.runningProcess) {
            await this.processManager.resetProcesses(data);
        } else {
            console.warn('Called reset game but no running process was found.')
        }
    }
    public clearGame() {
        if(this.runningProcess) {
            this.processManager.clearAllProcesses();
            this.connector.disconnect();
            this.joinedGame = false;
            this.connector = new Connector();
            this.onJoinGame.removeAll();
        } else {
            console.warn('Tried to clear game but no running process was found.')
        }
    }

    private validateServerOpts(serverGameOpts: ServerGameOptions) {
        return serverGameOpts.gottiId && serverGameOpts.hasOwnProperty('clientId') && serverGameOpts.proxyId
    }

    public updateServerGameData(data: any) {
        if(!this.runningProcess) {
            throw new Error('No process is running to update server game data.');
        }
        this.runningProcess.serverGameData = data;
    }

    public async authenticate(options?: any, tokenHeader?: string) {
        return new Promise((resolve, reject) => {
            httpPostAsync(`${this.webProtocol}//${this.baseHttpUrl}${GOTTI_HTTP_ROUTES.BASE_AUTH}${GOTTI_HTTP_ROUTES.AUTHENTICATE}`, tokenHeader, {[GOTTI_AUTH_KEY]: options }, (err, data) => {
                if (err) {
                    return reject(`Error requesting game ${err}`);
                } else {
                    const auth = data[GOTTI_AUTH_KEY];
                    const authId = data[GOTTI_GATE_AUTH_ID];
                    if(authId) {
                        this.setAuthValues(auth, authId);
                        return resolve(auth);
                    } else {
                        reject(`Error from authentication server`)
                    }
                }
            });
        });
    }

    public async register(options?: any, tokenHeader?: string) {
        return new Promise((resolve, reject) => {
            httpPostAsync(`${this.webProtocol}//${this.baseHttpUrl}${GOTTI_HTTP_ROUTES.BASE_AUTH}${GOTTI_HTTP_ROUTES.REGISTER}`, tokenHeader, {[GOTTI_AUTH_KEY]: options }, (err, data) => {
                if (err) {
                    return reject(`Error requesting game ${err}`);
                } else {
                    const auth = data[GOTTI_AUTH_KEY];
                    const authId = data[GOTTI_GATE_AUTH_ID];
                    if(authId) {
                        this.setAuthValues(auth, authId);
                        return resolve(auth);
                    } else {
                        reject(`Error from authentication server`)
                    }
                }
            });
        });
    }

    public async getGames(clientOptions?, token?) {
        if(!this.authId) {
            throw new Error(`You are not authenticated`)
        }
        return new Promise((resolve, reject) => {
            httpPostAsync(`${this.webProtocol}//${this.baseHttpUrl}${GOTTI_HTTP_ROUTES.BASE_GATE}${GOTTI_HTTP_ROUTES.GET_GAMES}`, token, {
                [GOTTI_GATE_AUTH_ID]: this.authId,
                [GOTTI_GET_GAMES_OPTIONS]: clientOptions,
            }, (err, data) => {
                if(err) {
                    return reject(`Error getting gate data ${err}`);
                }
                //   this.gameTypes = data.gameTypes;
                //     this.gameRegions = data.gameRegions;

                return resolve(data);
            });
        })
    }

    public async startOfflineGame(gameType, gameData?, areaData?) {
        if(this.runningProcess) {
            this.clearGame();
        }
        this.runningProcess = await this.processManager.initializeGame(gameType, gameData, areaData)
        this.processManager.startCurrentGameSystems();
        this.processManager.startProcess();
        return true;
    }

    public async joinGame(gameType, joinOptions?) {
        if(this.runningProcess) {
            this.clearGame();
        }
        const found = this.processManager['gameProcessSetups'].find(g => g.type === gameType);
        if(!found) throw new Error(`couldnt find gameType ${gameType} make sure it was initialized in client constructor`);

        if(found.isNetworked) {
            if(!this.authId) {
                throw new Error(`You are not authenticated to join a networked game`);
            }
            return new Promise((resolve, reject) => {
                httpPostAsync(`${this.webProtocol}//${this.baseHttpUrl}${GOTTI_HTTP_ROUTES.BASE_GATE}${GOTTI_HTTP_ROUTES.JOIN_GAME}`, '',
                    {
                        gameType,
                        [GOTTI_GET_GAMES_OPTIONS]: joinOptions,
                        [GOTTI_GATE_AUTH_ID]: this.authId,
                    }, async (err, data) => {
                        if (err) {
                            return reject(`Error requesting game ${err}`);
                        } else {
                            const {gottiId, clientId, proxyId, gameData, areaData} = data;
                            this.runningProcess = await this.processManager.initializeGame(gameType, gameData, areaData);
                            const joinOptions = await this.joinConnector(gottiId, clientId, `${this.baseHttpUrl}${GOTTI_HTTP_ROUTES.CONNECTOR}/${proxyId}`, areaData);
                            //TODO: initializing process only after onJoin returns
                            this.processManager.startCurrentGameSystems();
                            this.processManager.startProcess();
                            return resolve({ gameData, areaData, joinOptions });
                        }
                    });
            })
        } else {
           throw new Error('The found game is not a networked game, start with joinOfflineGame(gameType, gameData, areaData)')
        }
    }
    private joinOnlineGame(gameType, joinOptions?, token?, fps=6) {
    }

    public async joinInitialArea(clientOptions?) {
        if(!this.runningProcess) {
            throw new Error('There is no currently running networked process.')
        }
        if(!this.runningProcess.isNetworked) {
            throw new Error('The current running process is not networked, there is no area to write to.');
        }
        if(!this.joinedGame) {
            throw new Error('Make sure client.startGame\'s promise resolved when called with gotti credentials in parameters')
        }
        this.connector.joinInitialArea(clientOptions);

        return new Promise((resolve, reject) => {
            this.connector.onInitialArea.add(({ areaOptions, areaId, err }) => {
                if(err) {
                    return reject(err)
                }
                return resolve({ options: areaOptions, areaId });
            });
        });
    }

    /**
     * can dispatch process messages from within a client system using
     * this.dispatchProcessMessage()
     */
    public onProcessMessage(messageName: string, handler: Function) {
        this.processMessageHandlers[messageName] = handler;
    }

    public removeProcessMessage(messageName) {
        delete this.processMessageHandlers[messageName];
    }

    public raiseMessage(messageName, payload: any) {
        this.processMessageHandlers[messageName] && this.processMessageHandlers[messageName](payload);
    }


    private async joinConnector(gottiId, playerIndex, connectorURL, areaData) {

        const joinOpts = { gottiId, playerIndex, connectorURL } as ConnectorAuth;

        const options = await this.connector.connect(joinOpts, this.runningProcess, this.processManager, areaData, this.options, this.webSocketProtocol);

        this.joinedGame = true;

        return options;
    }

    public close() {
        this.joinedGame = false;
        this.connector.connection.close();
    }

    /**
     * Gate
     * @param gateId
     * @param options
     */
    public joinGate(options) {
    }

    private onMessage(message) {
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
    public sendSystemMessage(message: Message, limitEvery?: number) {
        this.connector.sendSystemMessage(message);
    }

    /**
     * sends message over network to server
     * @param message - system message to be processed on server
     */
    public sendImmediateSystemMessage(message: Message) {
        this.connector.sendImmediateSystemMessage(message);
    }

    /**
     * Fired off when we receive a server message containing the system message protocol, will dispatch into the message queue.
     * @param message
     */
    private onServerSystemMessage(message: Message) {};


    /**
     * Adds the system's onStateChange handler to be fired off for specific state path update
     * @param system
     * @param path
     */
    public addSystemPathListener(system: ClientSystem, path) {
        // adds system to state handlers if not already in it
        if(!(system.name in this.systemStateHandlers)) {
            this.initializeSystemStateHandler(system);
        }
        if(this.systemStateHandlers[system.name].paths.indexOf(path) > -1) {
            throw `Trying to listen to duplicate path ${path} for system ${system.name}`;
        }

        if(!(path in this.stateListeners)) {
            this.stateListeners[path] = [];
        }
        this.stateListeners[path].push[system.name];
    }

    /**
     * Removes a system's onStateChange handler from a specific path.
     * @param systemName
     * @param path
     */
    public removeSystemPathListener(systemName: string, path: string) {
        const listeners = this.stateListeners[path];

        if (!listeners.length) throw `There was no listeners for path ${path} when trying to remove from ${systemName}`;

        const index = listeners.indexOf(systemName);

        if (index < 0) throw `${systemName} was not listening to path ${path} could not remove a listener.`;


        listeners.splice(index, 1);

        // finally remove the path from systemStateHandlers
        this.systemStateHandlers[systemName].paths.splice(this.systemStateHandlers[systemName].paths.indexOf(path), 1);
    }

    /**
     * removes a system's onStateChange handler from any paths it was listening on.
     * gets called when you stop a system.
     * @param systemName
     */
    public removeSystemHandler(systemName: string) {
        if(this.systemStateHandlers[systemName] !== undefined) {
            let listeningPaths = this.systemStateHandlers[systemName].paths;
            delete this.systemStateHandlers[systemName];
            for(let i = 0; i < listeningPaths.length; i++) {
                //TODO: can maybe make this more efficient since we know were removing all paths
                this.removeSystemPathListener(systemName, listeningPaths[i]);
            }
        }
    }

    /**
     * puts system into lookup if it's going to be handling state updates.
     * @param system
     */
    private initializeSystemStateHandler(system) {
        this.systemStateHandlers[system.name] = {
            handler: system.onStateUpdate.bind(system),
            paths: [],
        }
    }
}

function httpGetAsync(url, token, callback)
{
    var http = new XMLHttpRequest();
    http.open("GET", url, true); // true for asynchronous

    http.responseType = 'text';
    http.setRequestHeader('authorization', token);

    http.onreadystatechange = function() {
        if (http.readyState == 4){
            if(http.status == 200) {
                callback(null, JSON.parse(http.responseText));
            } else {
                callback(JSON.parse(http.responseText), null);
            }
        }
    };
    http.send(null);
}

function httpPostAsync(url, token, request, callback) {
    const http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-Type', 'application/json');
    if(token) {
        //Send the proper header information along with the request
        http.setRequestHeader('authorization', token);
    }

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4) {
            if(http.status == 200) {
                callback(null, JSON.parse(http.responseText))
            } else {
                callback(JSON.parse(http.responseText), null);
            }
        }
    };
    http.send(JSON.stringify(request));
}