"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const DEFAULT_PATCH_RATE = 1000 / 20; // 20fps (50ms)
var LISTEN_REQUEST_FROM;
(function (LISTEN_REQUEST_FROM) {
    LISTEN_REQUEST_FROM[LISTEN_REQUEST_FROM["SERVER"] = 0] = "SERVER";
    LISTEN_REQUEST_FROM[LISTEN_REQUEST_FROM["CLIENT"] = 1] = "CLIENT";
})(LISTEN_REQUEST_FROM = exports.LISTEN_REQUEST_FROM || (exports.LISTEN_REQUEST_FROM = {}));
class AreaRoom extends events_1.EventEmitter {
    constructor(gottiProcess, areaId, publicOptions) {
        super();
        this.patchRate = DEFAULT_PATCH_RATE;
        this.gameLoopRate = DEFAULT_PATCH_RATE;
        this.metadata = null;
        this.clientsById = {};
        this.gottiProcess = null;
        this.gottiProcess = gottiProcess;
        this.publicOptions = publicOptions;
        this.areaId = areaId;
        this.masterChannel = null;
        this.areaChannel = null;
        this.clientsById = {};
    }
    initializeAndStart(masterChannel, areaChannel) {
        if (this.areaId !== areaChannel.channelId) {
            console.log('the area channel was', areaChannel.channelId);
            console.log('the area id was', this.areaId);
            throw 'Area Id and area channel id must be the same.';
        }
        this.areaChannel = areaChannel;
        this.masterChannel = masterChannel;
        this.registerBackChannelMessages();
        this.startGottiProcess();
    }
    startGottiProcess() {
        this.gottiProcess.addRoom(this);
        this.gottiProcess.clientManager.setClientWrite = (clientId, areaId, options) => {
            this.masterChannel.messageClient(clientId, [21 /* SET_CLIENT_AREA_WRITE */, areaId, options]);
        };
        this.gottiProcess.clientManager.removeClientListener = (clientId, options) => {
            this.masterChannel.messageClient(clientId, [23 /* REMOVE_CLIENT_AREA_LISTEN */, this.areaId, options]);
        };
        this.gottiProcess.clientManager.setClientListen = (clientId, areaId, options) => {
            this.masterChannel.messageClient(clientId, [22 /* ADD_CLIENT_AREA_LISTEN */, areaId, options]);
        };
        this.gottiProcess.startAllSystems();
        this.gottiProcess.startLoop(this.gameLoopRate);
    }
    // dispatches local message to server systems from room
    addMessage(message) {
        this.gottiProcess.messageQueue.add(message);
    }
    addImmediateMessage(message, isRemote) {
        this.gottiProcess.messageQueue.instantDispatch(message);
    }
    setState(state) {
        if (!this.areaChannel) {
            throw 'Please make sure the area channel has a channel attached before setting state.';
        }
        if (!(this.gottiProcess)) {
            throw 'Make sure the process was created before setting state';
        }
        this.areaChannel.setState(state);
        this.state = this.areaChannel.state;
        // adds state to all system globals property.
        this.gottiProcess.addGlobal(state);
    }
    /**
     * sends system message to all clients in the game.
     * @param message
     */
    dispatchToAllClients(message) {
        this.areaChannel.broadcast([28 /* SYSTEM_MESSAGE */, message.type, message.data, message.to, message.from]);
    }
    /**
     * sends system message to all clients who are listening to it
     * @param message
     */
    dispatchToLocalClients(message) {
        console.log('BROADCASTING LINKED!!!! WELL DOING DISPATCH TO LOCAL CLIENTS');
        this.areaChannel.broadcastLinked([28 /* SYSTEM_MESSAGE */, message.type, message.data, message.to, message.from]);
    }
    /**
     * sends system message to specific client.
     * @param client
     * @param message
     */
    dispatchToClient(client, message) {
        this.masterChannel.messageClient(client.id, [28 /* SYSTEM_MESSAGE */, message.type, message.data, message.to, message.from]);
    }
    dispatchToAreas(areaIds, message) {
        this.areaChannel.sendMainFront([34 /* AREA_TO_AREA_SYSTEM_MESSAGE */, message.type, message.data, message.to, message.from, areaIds]);
    }
    _onConnectorMessage() { }
    ;
    _onMessage(clientId, message) { }
    ;
    _onGlobalMessage(clientId, message) { }
    ;
    registerBackChannelMessages() {
        this.areaChannel.onMessage((message) => {
            console.log('got message', message);
            if (message[0] === 26 /* AREA_DATA */) {
                //    this.onMessage();
            }
            else if (message[0] === 34 /* AREA_TO_AREA_SYSTEM_MESSAGE */) {
                //  this.onMessage(message[1]);
            }
        });
        // get the add remote call reference from gottiProcess's message queue.
        const messageQueueRemoteDispatch = this.gottiProcess.messageQueue.addRemote.bind(this.gottiProcess.messageQueue);
        const messageQueueInstantRemoteDispatch = this.gottiProcess.messageQueue.instantDispatch.bind(this.gottiProcess.messageQueue);
        const clientManager = this.gottiProcess.clientManager;
        this.areaChannel.onClientMessage((clientId, message) => {
            const protocol = message[0];
            if (protocol === 26 /* AREA_DATA */) {
                //    this.onMessage();
            }
            else if (protocol === 28 /* SYSTEM_MESSAGE */) {
                messageQueueRemoteDispatch(message[1], message[2], message[3], message[4]);
            }
            else if (protocol === 29 /* IMMEDIATE_SYSTEM_MESSAGE */) {
                messageQueueInstantRemoteDispatch({ type: message[1], data: message[2], to: message[3], from: message[4] }, true);
            }
        });
        this.areaChannel.onAddClientListen((clientUid, options) => {
            clientManager.onClientListen.bind(clientManager);
            return options || true;
        });
        this.areaChannel.onAddClientWrite(clientManager.onClientWrite.bind(clientManager));
        this.areaChannel.onRemoveClientWrite(clientManager.onClientRemoveWrite.bind(clientManager));
        this.areaChannel.onRemoveClientListen(clientManager.onClientRemoveListen.bind(clientManager));
    }
}
exports.AreaRoom = AreaRoom;
