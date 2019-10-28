export const enum Protocol {
    // find connector related (1~9)
    CONNECTOR_URI = 2,
    CONNECTOR_URI_ERROR = 3,

        // connector-related (10~19)
    JOIN_CONNECTOR = 10,
    JOIN_CONNECTOR_ERROR = 11,
    LEAVE_CONNECTOR = 12,

        // area-related 20-29
    GET_INITIAL_CLIENT_AREA_WRITE = 20,
    SET_CLIENT_AREA_WRITE = 21,
    ADD_CLIENT_AREA_LISTEN = 22,
    REMOVE_CLIENT_AREA_LISTEN = 23,
    WRITE_AREA_ERROR = 24,
    LISTEN_AREA_ERROR = 25,

    AREA_DATA = 26,
    AREA_STATE_UPDATE = 27,
    SYSTEM_MESSAGE = 28,
    IMMEDIATE_SYSTEM_MESSAGE = 29,

        //global messages 30 - 39
    GLOBAL_DATA = 30,
    GAME_STARTING = 31,
    GAME_ENDING = 32,

        // area to area communication
    AREA_TO_AREA_SYSTEM_MESSAGE,

        // Generic messages (50~60)
    BAD_REQUEST = 50,

    // P2P/WEBRTC Codes
    CLIENT_WEB_RTC_ENABLED = 100,
    ENABLED_CLIENT_P2P_SUCCESS = 101,
    DISABLED_CLIENT_P2P = 102,
    OFFER_PEER_CONNECTION = 103,
    OFFER_PEER_CONNECTION_SUCCEEDED = 104,
    OFFER_PEER_CONNECTION_FAILED = 105,

    ANSWER_PEER_CONNECTION = 106,
    ANSWER_PEER_CONNECTION_SUCCEEDED = 107,
    ANSWER_PEER_CONNECTION_FAILED = 108,
    PEER_REMOTE_SYSTEM_MESSAGE = 109,
    PEERS_REMOTE_SYSTEM_MESSAGE = 110,

    SIGNAL_REQUEST= 111,
    SIGNAL_SUCCESS= 112,
    SIGNAL_FAILED=113,
    PEER_CONNECTION_REQUEST=114,

        // WebSocket error codes
    WS_SERVER_DISCONNECT = 4201,
    WS_TOO_MANY_CLIENTS = 4202,
}

export const GOTTI_ROUTE_BODY_PAYLOAD = '__GOTTI_ROUTE_BODY_PAYLOAD__';
export const GOTTI_GET_GAMES_OPTIONS = '__GOTTI_GET_GAMES_OPTIONS__';
export const GOTTI_GATE_AUTH_ID = '__GOTTI_AUTH_ID__';
export const GOTTI_AUTH_KEY = '__GOTTI_AUTH_KEY__';

export const GOTTI_HTTP_ROUTES = {
    BASE_AUTH: '/gotti_auth',
    AUTHENTICATE: '/gotti_authenticate',
    REGISTER: '/gotti_register',
    BASE_GATE: '/gotti_gate',
    GET_GAMES: '/gotti_games',
    JOIN_GAME: '/gotti_join_game'
}

export enum PeerDisconnectionReasons {
    PEER_PLAYER_DISCONNECTED_FROM_SERVER,
    PEER_PLAYER_TIMED_OUT,
    PEER_MANUALLY_CLOSED,
}

export enum PEER_TO_PEER_PROTOCOLS {
    PING=0,
    PONG=1
}

export enum StateProtocol {
    SET = 0,
    PATCH = 1
}

export const enum GateProtocols {
    CLIENT_REQUEST_CONNECTOR,
}

