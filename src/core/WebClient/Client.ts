import { Signal } from '@gamestdio/signals';
import * as msgpack from './msgpack';

import { Protocol } from './Protocol';
import { Connector } from './Connector';
import ClientSystem from './../System/ClientSystem';
import { ClientMessageQueue, Message } from '../ClientMessageQueue';

export type JoinOptions = { retryTimes: number, requestId: number } & any;

import { ClientProcess } from '../Process/Client';

interface Window {
    RTCPeerConnection?: any;
    navigator?: any;
}
declare var window: Window;


export class Client {
    private runningProcess: ClientProcess = null;
    private processes: {[gameType: string]: ClientProcess } = {};
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

    private token: string;

    readonly isWebRTCSupported: boolean;

    constructor(url: string, token: string) {
        this.hostname = url;
        this.options = {};
        this.token = token;
        this.connector = new Connector();

        this.isWebRTCSupported = window.RTCPeerConnection && window.navigator.userAgent.indexOf("Edge") > -1;
    }

    public addGameProcess(gameType, process: ClientProcess) {
        if(gameType in this.processes) {
            throw new Error(`Duplicate named game process: ${gameType}`)
        }
        this.processes[gameType] = process;
    }

    public async getConnectorData(gameType, options) {
        return new Promise((resolve, reject) => {
            httpPostAsync(`${this.hostname}/gate`, this.token, { gameType, options }, (err, data) => {
                if (err) {
                    return reject(`Error requesting game ${err}`);
                } else {
                    return resolve(data);
                }
            });
        })
    }

    public async startGame(gameType, fps=60, serverGameData?, gottiId?, host?, port?) {
        return new Promise((resolve, reject) => {
            const process = this.processes[gameType];

            if(!process) {
                return reject('Invalid gameType');
            }

            if(serverGameData) {
                process.serverGameData = serverGameData;
            }

            this.startGameProcess(process, fps);

            if(process.isNetworked) {
                this.joinConnector(gottiId, `${host}:${port}`).then(joinOptions => {
                    return resolve(joinOptions);
                });
            } else {
                return resolve();
            }
        });
    }

    public updateServerGameData(data: any) {
        if(!this.runningProcess) {
            throw new Error('No process is running to update server game data.');
        }
        this.runningProcess.serverGameData = data;
    }

    public stopGame() {
        if(!this.runningProcess) {
            throw new Error('No process is running to stop');
        }
        if(this.runningProcess.isNetworked) {
            this.close()
        }
        this.clearGameProcess();
    }

    private startGameProcess(process, fps) {
        if(this.runningProcess !== null) {
            this.clearGameProcess();
        }
        this.runningProcess = process;
        this.runningProcess.startAllSystems();
        this.runningProcess.startLoop(fps);
    }

    private clearGameProcess() {
        this.runningProcess.stopAllSystems();
        this.runningProcess.stopLoop();
        this.runningProcess = null;
    }

    public async getGateData() {
        return new Promise((resolve, reject) => {
            httpGetAsync(`${this.hostname}/gate`, this.token, (err, data) => {
                if(err) {
                    return reject(`Error getting gate data ${err}`);
                }
                //   this.gameTypes = data.gameTypes;
                //     this.gameRegions = data.gameRegions;

                return resolve(data);
            });
        })
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
    public writeInitialArea(clientOptions?) {
        console.log('joining initial area... please register the onAreaWrite in one of your systems to handle the callback.');

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
    }

    private async joinConnector(gottiId, connectorURL) {

        const options = await this.connector.connect(gottiId, connectorURL, this.runningProcess, { options: { isWebRTCSupported: this.isWebRTCSupported } });

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
    var http = new XMLHttpRequest();
    http.open('POST', url, true);

//Send the proper header information along with the request
    http.setRequestHeader('Content-Type', 'application/json');
    http.setRequestHeader('authorization', token);

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