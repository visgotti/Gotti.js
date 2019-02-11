"use strict";
/***************************************************************************************
 *  Modified implementation of the original Room class in colyseus, most of the code
 *  is copied directly from the version of colyseus the project was started with to prevent
 *  breaking changes that would come from extending or implementing it directly.
 *
 *  Original code was written by-
 *  https://github.com/colyseus and https://github.com/endel
 *
 *  modified to fit GottiColyseus by -
 *  https://github.com/visgotti
 ***************************************************************************************/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const Util_1 = require("../Util");
const parseURL = require("url-parse");
const WebSocket = require("ws");
const dist_1 = require("gotti-reqres/dist");
const dist_2 = require("gotti-channels/dist");
const Protocol_1 = require("../Protocol");
const nanoid = require('nanoid');
const events_1 = require("events");
//import { debugAndPrintError, debugPatch, debugPatchData } from '../../colyseus/lib/Debug';
const DEFAULT_PATCH_RATE = 1000 / 20; // 20fps (50ms)
const DEFAULT_SIMULATION_INTERVAL = 1000 / 60; // 60fps (16.66ms)
const DEFAULT_SEAT_RESERVATION_TIME = 3;
class Connector extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.maxClients = Infinity;
        this.patchRate = DEFAULT_PATCH_RATE;
        this.autoDispose = true;
        this.metadata = null;
        this.masterChannel = null;
        this.clients = [];
        this.clientsById = {};
        this.reservedSeats = {};
        this.onConnection = (client, req) => {
            client.pingCount = 0;
            const upgradeReq = req || client.upgradeReq;
            const url = parseURL(upgradeReq.url);
            const query = Util_1.parseQueryString(url.query);
            req.gottiId = query.gottiId;
            if (!(client) || !(req.gottiId) || !(this.reservedSeats[req.gottiId])) {
                Protocol_1.send(client, [11 /* JOIN_CONNECTOR_ERROR */]);
            }
            else {
                client.gottiId = req.gottiId;
                this._onJoin(client, this.reservedSeats[req.gottiId].auth);
            }
            // prevent server crashes if a single client had unexpected error
            client.on('error', (err) => console.error(err.message + '\n' + err.stack));
            //send(client, [Protocol.USER_ID, client.gottiId])
        };
        this.areaRoomIds = options.areaRoomIds;
        this.connectorURI = options.connectorURI;
        this.areaServerURIs = options.areaServerURIs;
        this.serverIndex = options.serverIndex;
        this.port = options.port | 8080;
        this.options = options;
        this.options.port = this.port;
        if (options.server === 'http') {
            this.httpServer = http.createServer();
            this.options.server = this.httpServer;
        }
        else if (options.server === 'net') {
        }
        else {
            throw 'please use http or net as server option';
        }
        this.responder = new dist_1.Messenger({
            response: true,
            id: `${this.serverIndex}_responder`,
            brokerURI: options.gateURI,
        });
        this.registerGateResponders();
        //this.setPatchRate(this.patchRate);
    }
    connectToAreas() {
        return __awaiter(this, void 0, void 0, function* () {
            this.masterChannel = new dist_2.FrontMaster(this.serverIndex);
            this.masterChannel.initialize(this.connectorURI, this.areaServerURIs);
            this.masterChannel.addChannels(this.areaRoomIds);
            this.channels = this.masterChannel.frontChannels;
            //TODO: right now you need to wait a bit after connecting and binding to uris will refactor channels eventually to fix this
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.masterChannel.connect().then((connection) => {
                        this.areaOptions = connection.backChannelOptions;
                        this.registerAreaMessages();
                        this.server = new WebSocket.Server(this.options);
                        this.server.on('connection', this.onConnection.bind(this));
                        this.on('connection', this.onConnection.bind(this)); // used for testing
                        console.log(`Connector ${this.serverIndex} succesfully listening for client connections on port ${this.port}`);
                        return resolve(true);
                    });
                }, 500);
            });
        });
    }
    /**
     * @param clientId - id client authenticated from gate server as
     * @param auth - authentication data sent from Gate server.
     * @returns {number}
     */
    requestJoin(auth) {
        return 1;
    }
    disconnect(closeHttp = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.autoDispose = true;
            let i = this.clients.length;
            while (i--) {
                const client = this.clients[i];
                client.close(Protocol_1.WS_CLOSE_CONSENTED);
            }
            if (this.masterChannel) {
                this.masterChannel.disconnect();
            }
            return new Promise((resolve, reject) => {
                if (closeHttp) {
                    this.httpServer.forceShutdown(() => {
                        resolve(true);
                    });
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    broadcast(data, options) {
        // no data given, try to broadcast patched state
        if (!data) {
            throw new Error('Room#broadcast: \'data\' is required to broadcast.');
        }
        let numClients = this.clients.length;
        while (numClients--) {
            const client = this.clients[numClients];
            if ((!options || options.except !== client)) {
                Protocol_1.send(client, data, false);
            }
        }
        return true;
    }
    /*
    protected sendState(client: Client): void {

        const stateUpdates = client.channelClient.queuedEncodedUpdates;
        if (stateUpdates.length) {

            send(client, [
                    Protocols.STATE_UPDATES,
                    stateUpdates
                //this.clock.currentTime,
                //this.clock.elapsedTime]
            );
            // clear updates after sent.
            client.channelClient.clearStateUpdates();
        }
    }
    */
    registerClientAreaMessageHandling(client) {
        client.channelClient.onMessage((message) => {
            if (message[0] === 28 /* SYSTEM_MESSAGE */ || message[0] === 29 /* IMMEDIATE_SYSTEM_MESSAGE */) {
                Protocol_1.send(client, message, false);
            }
            else if (message[0] === 22 /* ADD_CLIENT_AREA_LISTEN */) {
                // message[1] areaId,
                // message[2] options
                this.addAreaListen(client, message[1], message[2]);
            }
            else if (message[0] === 23 /* REMOVE_CLIENT_AREA_LISTEN */) {
                this.removeAreaListen(client, message[1], message[2]);
            }
            else if (message[0] === 21 /* SET_CLIENT_AREA_WRITE */) {
                console.log('got request to change write on connector from area');
                // the removeOldWriteListener will be false since that should be explicitly sent from the old area itself.
                this.changeAreaWrite(client, message[1], message[2]);
            }
            else {
                throw new Error('Unhandled client message protocol' + message[0]);
            }
        });
    }
    registerAreaMessages() {
        Object.keys(this.channels).forEach(channelId => {
            const channel = this.channels[channelId];
            channel.onMessage((message) => {
                if (message[0] === 28 /* SYSTEM_MESSAGE */ || message[0] === 29 /* IMMEDIATE_SYSTEM_MESSAGE */) {
                    // get all listening clients for area/channel
                    const listeningClientUids = channel.listeningClientUids;
                    let numClients = listeningClientUids.length;
                    // iterate through all and relay message
                    while (numClients--) {
                        const client = this.clientsById[listeningClientUids[numClients]];
                        console.log('RELAYING THE SYSTEM MESSAGE', message, 'to client, ', client.gottiId, 'from AREA ID', channel.channelId);
                        Protocol_1.send(client, message);
                    }
                }
                else if (message[0] === 34 /* AREA_TO_AREA_SYSTEM_MESSAGE */) {
                }
            });
        });
    }
    _onAreaMessage(message) {
        this.broadcast(message);
    }
    _getInitialArea(client, clientOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('RUNNING GET INITIAL AREA!!!lwe');
            const write = this.getInitialArea(client, client.auth, clientOptions);
            if (write) {
                // will dispatch area messages to systems
                yield this.changeAreaWrite(client, write.areaId, write.options);
                return true;
            }
            else {
                Protocol_1.send(client, 24 /* WRITE_AREA_ERROR */);
                return false;
            }
        });
    }
    _onWebClientMessage(client, message) {
        message = Protocol_1.decode(message);
        if (!message) {
            //    debugAndPrintError(`${this.roomName} (${this.roomId}), couldn't decode message: ${message}`);
            return;
        }
        if (message[0] === 28 /* SYSTEM_MESSAGE */) {
            client.channelClient.sendLocal(message);
        }
        else if (message[0] === 29 /* IMMEDIATE_SYSTEM_MESSAGE */) {
            client.channelClient.sendLocalImmediate(message);
        }
        else if (message[0] === 20 /* GET_INITIAL_CLIENT_AREA_WRITE */) {
            this._getInitialArea(client, message[1]);
        }
        else if (message[0] === 12 /* LEAVE_CONNECTOR */) {
            // stop interpreting messages from this client
            client.removeAllListeners('message');
            // prevent "onLeave" from being called twice in case the connection is forcibly closed
            client.removeAllListeners('close');
            // only effectively close connection when "onLeave" is fulfilled
            this._onLeave(client, Protocol_1.WS_CLOSE_CONSENTED).then(() => client.close());
        }
    }
    addAreaListen(client, areaId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const linkedResponse = yield client.channelClient.linkChannel(areaId, options);
                console.log('response options were', linkedResponse);
                /* adds newest state from listened area to the clients queued state updates as a 'SET' update
                 sendState method forwards then empties that queue, any future state updates from that area
                 will be added to the client's queue as 'PATCH' updates. */
                // this.sendState(client);
                Protocol_1.send(client, [22 /* ADD_CLIENT_AREA_LISTEN */, areaId, linkedResponse]);
                return true;
            }
            catch (err) {
                console.log('clientId was:', client.gottiId);
                console.log('areaId was', areaId);
                console.log('error in addAreaListen was', err);
                //   console.log('error was', err);
                return false;
            }
        });
    }
    /**
     *
     * @param client
     * @param newAreaId - new area id that will become the writer
     * @param writeOptions - options that get sent with the new write client notification to the new area
     * @returns {boolean}
     */
    changeAreaWrite(client, newAreaId, writeOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldAreaId = client.channelClient.processorChannel;
            let isLinked = client.channelClient.isLinkedToChannel(newAreaId);
            if (!(isLinked)) {
                isLinked = yield this.addAreaListen(client, newAreaId, writeOptions);
            }
            if (isLinked) {
                console.log('setting client processor channel...');
                const success = client.channelClient.setProcessorChannel(newAreaId, false, writeOptions);
                if (success) {
                    Protocol_1.send(client, [21 /* SET_CLIENT_AREA_WRITE */, newAreaId, writeOptions]);
                    return true;
                }
            }
            return false;
        });
    }
    removeAreaListen(client, areaId, options) {
        if (!(this.masterChannel.frontChannels[areaId])) {
            console.error('invalid areaId');
        }
        client.channelClient.unlinkChannel(areaId);
        Protocol_1.send(client, [23 /* REMOVE_CLIENT_AREA_LISTEN */, areaId, options]);
    }
    _onJoin(client, auth) {
        // clear the timeout and remove the reserved seat since player joined
        clearTimeout(this.reservedSeats[client.gottiId].timeout);
        delete this.reservedSeats[client.gottiId];
        // add a channelClient to client
        client.channelClient = new dist_2.Client(client.gottiId, this.masterChannel);
        // register channel/area message handlers
        this.registerClientAreaMessageHandling(client);
        this.clients.push(client);
        this.clientsById[client.gottiId] = client;
        let joinOptions = null;
        if (this.onJoin) {
            joinOptions = this.onJoin(client, auth);
        }
        Protocol_1.send(client, [10 /* JOIN_CONNECTOR */, this.areaOptions, joinOptions]);
        client.on('message', this._onWebClientMessage.bind(this, client));
        client.once('close', this._onLeave.bind(this, client));
    }
    _onLeave(client, code) {
        return __awaiter(this, void 0, void 0, function* () {
            // call abstract 'onLeave' method only if the client has been successfully accepted.
            if (Util_1.spliceOne(this.clients, this.clients.indexOf(client)) && this.onLeave) {
                delete this.clientsById[client.sessionId];
                // disconnect gotti client too.
                client.channelClient.unlinkChannel();
                yield this.onLeave(client, (code === Protocol_1.WS_CLOSE_CONSENTED));
                //TODO: notify gate server
            }
            this.emit('leave', client);
        });
    }
    /**
     * reserves seat till player joins
     * @param clientId - id of player to reserve seat for
     * @param auth - data player authenticated with on gate.
     * @private
     */
    _reserveSeat(clientId, auth) {
        this.reservedSeats[clientId] = {
            auth,
            timeout: setTimeout(() => {
                delete this.reservedSeats[clientId];
            }, 10000) // reserve seat for 10 seconds
        };
    }
    /**
     * Handles request from gate server, whatever this returns gets sent back to the gate server
     * to notify it if the reserve seat request went through or not.
     * @param data - data sent from gate server after play authenticated
     * @private
     */
    _requestJoin(data) {
        const auth = data[0];
        if (this.requestJoin(auth)) {
            const gottiId = Util_1.generateId();
            this._reserveSeat(gottiId, auth);
            // todo send host n port
            return { URL: this.port, gottiId };
        }
        else {
            return false;
        }
    }
    //TODO: maybe need to ping gate before?
    registerGateResponders() {
        this.responder.createResponse("2" /* HEARTBEAT */ + '-' + this.serverIndex, () => {
            return [this.serverIndex, this.clients.length];
        });
        this.responder.createResponse("1" /* RESERVE_PLAYER_SEAT */ + '-' + this.serverIndex, this._requestJoin.bind(this));
    }
}
exports.Connector = Connector;
