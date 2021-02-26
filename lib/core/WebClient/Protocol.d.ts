export declare const enum Protocol {
    SYSTEM_MESSAGE = 0,
    SYSTEM_TO_MULTIPLE_CLIENT_MESSAGES = 1,
    IMMEDIATE_SYSTEM_MESSAGE = 2,
    ACK_SYNC = 3,
    SYSTEM_MESSAGE_RELIABLE = 6,
    SYSTEM_TO_MULTIPLE_CLIENT_MESSAGES_RELIABLE = 7,
    IMMEDIATE_SYSTEM_MESSAGE_RELIABLE = 8,
    SYSTEM_MESSAGE_RELIABLE_ORDERED = 12,
    SYSTEM_TO_MULTIPLE_CLIENT_MESSAGES_RELIABLE_ORDERED = 13,
    IMMEDIATE_SYSTEM_MESSAGE_RELIABLE_ORDERED = 14,
    JOIN_CONNECTOR = 15,
    JOIN_CONNECTOR_ERROR = 16,
    LEAVE_CONNECTOR = 17,
    INITIATE_CHANGE_TO_WEBRTC = 18,
    SERVER_WEBRTC_CANDIDATE = 19,
    GET_INITIAL_CLIENT_AREA_WRITE = 20,
    SET_CLIENT_AREA_WRITE = 21,
    ADD_CLIENT_AREA_LISTEN = 22,
    REMOVE_CLIENT_AREA_LISTEN = 23,
    WRITE_AREA_ERROR = 24,
    LISTEN_AREA_ERROR = 25,
    AREA_STATE_UPDATE = 27,
    AREA_DATA = 26,
    GLOBAL_DATA = 40,
    GAME_STARTING = 41,
    GAME_ENDING = 42,
    AREA_PUBLIC_OPTIONS = 43,
    AREA_TO_AREA_SYSTEM_MESSAGE = 44,
    AREA_TO_MASTER_MESSAGE = 45,
    MASTER_TO_AREA_BROADCAST = 46,
    GLOBAL_MASTER_MESSAGE = 47,
    BAD_REQUEST = 50,
    CLIENT_WEB_RTC_ENABLED = 100,
    ENABLED_CLIENT_P2P_SUCCESS = 101,
    DISABLED_CLIENT_P2P = 102,
    OFFER_PEER_CONNECTION = 103,
    OFFER_PEER_CONNECTION_SUCCEEDED = 104,
    OFFER_PEER_CONNECTION_FAILED = 105,
    ANSWER_PEER_CONNECTION = 106,
    ANSWER_PEER_CONNECTION_SUCCEEDED = 107,
    ANSWER_PEER_CONNECTION_FAILED = 108,
    SIGNAL_REQUEST = 111,
    SIGNAL_SUCCESS = 112,
    SIGNAL_FAILED = 113,
    PEER_CONNECTION_REQUEST = 114,
    PEER_REMOTE_SYSTEM_MESSAGE = 109,
    PEERS_REMOTE_SYSTEM_MESSAGE = 110,
    RESPONSE_TO_PEER_CONNECTION_REQUEST = 111,
    REQUEST_PEER_DISCONNECT = 112,
    SEND_PEER_CONNECTION_DATA = 113,
    SEND_PEER_MESSAGE = 114,
    BROADCAST_PEER_MESSAGE = 115,
    FAILED_SEND_PEER_MESSAGE = 116,
    FAILED_BROADCAST_PEER_MESSAGE = 117,
    ADDED_P2P = 118,
    REMOVED_P2P = 119,
    WS_SERVER_DISCONNECT = 4201,
    WS_TOO_MANY_CLIENTS = 4202
}
export declare const GOTTI_ROUTE_BODY_PAYLOAD = "__GOTTI_ROUTE_BODY_PAYLOAD__";
export declare const GOTTI_GET_GAMES_OPTIONS = "__GOTTI_GET_GAMES_OPTIONS__";
export declare const GOTTI_GATE_AUTH_ID = "__GOTTI_AUTH_ID__";
export declare const GOTTI_AUTH_KEY = "__GOTTI_AUTH_KEY__";
export declare const GOTTI_HTTP_ROUTES: {
    BASE_AUTH: string;
    AUTHENTICATE: string;
    REGISTER: string;
    BASE_GATE: string;
    GET_GAMES: string;
    JOIN_GAME: string;
    BASE_PUBLIC_API: string;
    CONNECTOR: string;
};
export declare enum PeerDisconnectionReasons {
    PEER_PLAYER_DISCONNECTED_FROM_SERVER = 0,
    PEER_PLAYER_TIMED_OUT = 1,
    PEER_MANUALLY_CLOSED = 2
}
export declare enum PEER_TO_PEER_PROTOCOLS {
    PING = 0,
    PONG = 1
}
export declare enum StateProtocol {
    SET = 0,
    PATCH = 1
}
export declare const enum GateProtocols {
    CLIENT_REQUEST_CONNECTOR = 0
}
