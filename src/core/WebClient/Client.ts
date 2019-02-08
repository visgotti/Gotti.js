import { Signal } from '@gamestdio/signals';
import * as msgpack from './msgpack';

import { Protocol } from './Protocol';
import { Connector } from './Connector';
import ClientSystem from './../System/ClientSystem';
import { ClientProcess } from './../Process/Client';
import { MessageQueue, Message } from './../MessageQueue';

export type JoinOptions = { retryTimes: number, requestId: number } & any;

export class Client {
    private process: ClientProcess;
    private inGate = false;
    private stateListeners : {[path: string]: Array<string>} = {};
    private systemStateHandlers: {[systemName: string]: {
        handler: Function,
        paths: Array<string>,
    };
    } = {};

    public id?: string;

    public authenticated: boolean = false;
    public options: any;
    public gameTypes: Array<string> = [];
    public gameRegions: Array<string> = [];

    private _messageQueue: MessageQueue = null;

    protected connector: Connector;

    protected requestId = 0;

    protected hostname: string;

    private token: string;

    constructor(url: string, token: string) {
        this.hostname = url;
        this.options = {};
        this.token = token;
        this.connector = new Connector();
    }

    set messageQueue(value: MessageQueue) {
        this._messageQueue = value;
        this.connector.messageQueue = value;
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

    public async requestGame(gameType) {
        return new Promise((resolve, reject) => {
            httpPostAsync(`${this.hostname}/gate`, this.token, { gameType }, (err, data) => {
                if(err) {
                    return reject(`Error requesting game ${err}`);
                } else {
                    this.connector = new Connector();
                    return resolve(data)
                }
            })
        });
    }

    public joinConnector(url, gottiId) {
        if(!(this._messageQueue)) {
            throw new Error('Message queue was not initialized in web client, can not join Connector.')
        }
        this.connector.connect(url, gottiId);
        // this.connect(port);
    }


    public close() {
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
     * @param limitEvery - optional
     */
    public send(message: Message, limitEvery?: number) {

        // this.room.send([ Protocols.CLIENT_SYSTEM_MESSAGE, message ]);
    }

    public joinRoom(roomId, options) {
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
    public listenArea(areaId, options?: any) {
        //  this.room.send([Protocols.ADD_AREA_LISTEN, options]);
    }

    /**
     * Sends a request to the server to stop listening for messages and state updates from an area.
     * @param areaId
     * @param options
     */
    public removeListenArea(areaId, options?: any) {
        //   this.room.send([Protocols.REMOVE_AREA_LISTEN, options]);
    }

    /**
     * Sends a request to the server to join an area, this doesnt change your listening status,
     * but it will cause the joined area to be your 'main' area and will be the area that processes
     * any messages the client sends with sendLocal.
     * @param areaId
     * @param options
     */
    public joinArea(areaId, options?: any) {
        //   this.room.send([Protocols.CHANGE_AREA_WRITE, options]);
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