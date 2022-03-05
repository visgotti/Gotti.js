"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateProtocol = exports.PEER_TO_PEER_PROTOCOLS = exports.PeerDisconnectionReasons = exports.GOTTI_HTTP_ROUTES = exports.GOTTI_AUTH_KEY = exports.GOTTI_GATE_AUTH_ID = exports.GOTTI_GET_GAMES_OPTIONS = exports.GOTTI_ROUTE_BODY_PAYLOAD = void 0;
exports.GOTTI_ROUTE_BODY_PAYLOAD = '__GOTTI_ROUTE_BODY_PAYLOAD__';
exports.GOTTI_GET_GAMES_OPTIONS = '__GOTTI_GET_GAMES_OPTIONS__';
exports.GOTTI_GATE_AUTH_ID = '__GOTTI_AUTH_ID__';
exports.GOTTI_AUTH_KEY = '__GOTTI_AUTH_KEY__';
exports.GOTTI_HTTP_ROUTES = {
    BASE_AUTH: '/gotti_auth',
    AUTHENTICATE: '/gotti_authenticate',
    REGISTER: '/gotti_register',
    BASE_GATE: '/gotti_gate',
    GET_GAMES: '/gotti_games',
    JOIN_GAME: '/gotti_join_game',
    BASE_PUBLIC_API: '/gotti_api',
    CONNECTOR: '/gotti_connector'
};
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
