"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Clock = require("@gamestdio/clock");
const signals_1 = require("@gamestdio/signals");
const state_listener_1 = require("@gamestdio/state-listener");
const fossilDelta = require("fossil-delta");
const msgpack = require("./msgpack");
const Connection_1 = require("./Connection");
const Protocol_1 = require("./Protocol");
var AreaStatus;
(function (AreaStatus) {
    AreaStatus[AreaStatus["NOT_IN"] = 0] = "NOT_IN";
    AreaStatus[AreaStatus["LISTEN"] = 1] = "LISTEN";
    AreaStatus[AreaStatus["WRITE"] = 2] = "WRITE";
})(AreaStatus = exports.AreaStatus || (exports.AreaStatus = {}));
class Connector {
    constructor() {
        this.clock = new Clock(); // experimental
        this.remoteClock = new Clock(); // experimental
        // Public signals
        this.onJoinConnector = new signals_1.Signal();
        this.onWrite = new signals_1.Signal();
        this.onListen = new signals_1.Signal();
        this.onRemoveListen = new signals_1.Signal();
        this.onStateChange = new signals_1.Signal();
        this.onMessage = new signals_1.Signal();
        this.onError = new signals_1.Signal();
        this.onLeave = new signals_1.Signal();
        this.onLeave.add(() => this.removeAllListeners());
    }
    set messageQueue(value) {
        this._messageQueue = value;
    }
    connect(gottiId, URL, options = {}) {
        if (!(this._messageQueue)) {
            throw new Error('Message queue was not initialized for web client\'s Connector, can not connect Connector.');
        }
        this.gottiId = gottiId;
        let url = this.buildEndPoint(URL, options);
        this.connection = new Connection_1.Connection(url);
        this.connection.onmessage = this.onMessageCallback.bind(this);
    }
    requestListen(areaId, options) {
        if (!(areaId in this.areas)) {
            throw new Error(`trying to listen to non existent area ${areaId}`);
        }
        this.connection.send([21 /* REQUEST_LISTEN_AREA */,]);
    }
    leave() {
        if (this.connection) {
            //     this.connection.send([Protocol.LEAVE_ROOM]);
        }
        else {
            this.onLeave.dispatch();
        }
    }
    sendSystemMessage(message) {
        this.connection.send([28 /* SYSTEM_MESSAGE */, this.id, message.type, message.data, message.to, message.from]);
    }
    writeArea(areaId, options) {
        this.connection.send([20 /* REQUEST_WRITE_AREA */, this.id, areaId, options]);
    }
    listenArea(areaId, options) {
        this.connection.send([21 /* REQUEST_LISTEN_AREA */, this.id, areaId, options]);
    }
    get hasJoined() {
        return this.sessionId !== undefined;
    }
    removeAllListeners() {
        //  super.removeAllListeners();
        this.onJoinConnector.removeAll();
        this.onStateChange.removeAll();
        this.onMessage.removeAll();
        this.onError.removeAll();
        this.onLeave.removeAll();
    }
    onJoin(sessionId, gameId, areaOptions) {
        this.sessionId = sessionId;
        this.onJoinConnector.dispatch(gameId, areaOptions);
        Object.keys(areaOptions).forEach(areaId => {
            this.areas[areaId] = {
                _previousState: {},
                status: AreaStatus.NOT_IN,
                state: new state_listener_1.StateContainer({}),
                options: areaOptions[areaId],
            };
        });
    }
    onMessageCallback(event) {
        const message = msgpack.decode(new Uint8Array(event.data));
        const code = message[0];
        if (code === 10 /* JOIN_CONNECTOR */) {
            // [sessionId, client.id, gameId, areaOptions]
            this.onJoin(message[1], message[2], message[3]);
        }
        else if (code === 11 /* JOIN_CONNECTOR_ERROR */) {
            this.onError.dispatch(message[1]);
        }
        else if (code === 20 /* REQUEST_WRITE_AREA */) {
            // newAreaId, oldAreaId?, options?
            if (message[2]) {
                this.areas[message[1]].status = AreaStatus.LISTEN;
            }
            this.areas[message[0]].status = AreaStatus.WRITE;
            this.onWrite.dispatch(message[1], message[2], message[3]);
        }
        else if (code === 21 /* REQUEST_LISTEN_AREA */) {
            // areaId, options?
            this.areas[message[1]].status = AreaStatus.LISTEN;
            this.onListen.dispatch(message[1], message[2]);
        }
        else if (code === 24 /* REQUEST_REMOVE_LISTEN_AREA */) {
            this.areas[message[1]].status = AreaStatus.NOT_IN;
            this.onRemoveListen.dispatch();
        }
        else if (code === 28 /* SYSTEM_MESSAGE */) {
            // this.messageQueue.addRemote(message[1], message[2], message[3], message[4]);
        }
        else if (code === 27 /* AREA_STATE_UPDATE */) {
            const updateType = message[1];
            const areaId = message[2];
            if (updateType === Protocol_1.StateProtocol.SET) {
                this.setState(message[1], message[2]);
            }
            else if (updateType === Protocol_1.StateProtocol.PATCH) {
                this.patch(message[1], message[2]);
            }
        } // else if (code === Protocol.LEAVE_ROOM) {
        //   this.leave();
        //  }
    }
    setState(areaId, encodedState) {
        const state = msgpack.decode(encodedState);
        const area = this.areas[areaId];
        area.state.set(state);
        this._previousState = new Uint8Array(encodedState);
        this.onStateChange.dispatch(state);
    }
    patch(areaId, binaryPatch) {
        // apply patch
        const area = this.areas[areaId];
        area._previousState = Buffer.from(fossilDelta.apply(area._previousState, binaryPatch));
        // trigger state callbacks
        area.state.set(msgpack.decode(area._previousState));
        this.onStateChange.dispatch(area.state);
    }
    buildEndPoint(URL, options = {}) {
        const params = [`gottiId=${this.gottiId}`];
        for (const name in options) {
            if (!options.hasOwnProperty(name)) {
                continue;
            }
            params.push(`${name}=${options[name]}`);
        }
        return `${URL}/?${params.join('&')}`;
    }
}
exports.Connector = Connector;
