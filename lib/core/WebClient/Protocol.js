"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PeerDisconnectionReasons;
(function (PeerDisconnectionReasons) {
    PeerDisconnectionReasons[PeerDisconnectionReasons["PEER_PLAYER_DISCONNECTED_FROM_SERVER"] = 0] = "PEER_PLAYER_DISCONNECTED_FROM_SERVER";
    PeerDisconnectionReasons[PeerDisconnectionReasons["PEER_PLAYER_TIMED_OUT"] = 1] = "PEER_PLAYER_TIMED_OUT";
    PeerDisconnectionReasons[PeerDisconnectionReasons["PEER_MANUALLY_CLOSED"] = 2] = "PEER_MANUALLY_CLOSED";
})(PeerDisconnectionReasons = exports.PeerDisconnectionReasons || (exports.PeerDisconnectionReasons = {}));
var PEER_TO_PEER_PROTOCOLS;
(function (PEER_TO_PEER_PROTOCOLS) {
    PEER_TO_PEER_PROTOCOLS[PEER_TO_PEER_PROTOCOLS["PING"] = 0] = "PING";
    PEER_TO_PEER_PROTOCOLS[PEER_TO_PEER_PROTOCOLS["PONG"] = 1] = "PONG";
})(PEER_TO_PEER_PROTOCOLS = exports.PEER_TO_PEER_PROTOCOLS || (exports.PEER_TO_PEER_PROTOCOLS = {}));
var StateProtocol;
(function (StateProtocol) {
    StateProtocol[StateProtocol["SET"] = 0] = "SET";
    StateProtocol[StateProtocol["PATCH"] = 1] = "PATCH";
})(StateProtocol = exports.StateProtocol || (exports.StateProtocol = {}));
