export declare const enum Protocol {
    CONNECTOR_URI = 2,
    CONNECTOR_URI_ERROR = 3,
    JOIN_CONNECTOR = 10,
    JOIN_CONNECTOR_ERROR = 11,
    LEAVE_CONNECTOR = 12,
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
    GLOBAL_DATA = 30,
    GAME_STARTING = 31,
    GAME_ENDING = 32,
    AREA_TO_AREA_SYSTEM_MESSAGE = 33,
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
    PEER_REMOTE_SYSTEM_MESSAGE = 109,
    PEERS_REMOTE_SYSTEM_MESSAGE = 110,
    SIGNAL_REQUEST = 111,
    SIGNAL_SUCCESS = 112,
    SIGNAL_FAILED = 113,
    WS_SERVER_DISCONNECT = 4201,
    WS_TOO_MANY_CLIENTS = 4202
}
export declare enum StateProtocol {
    SET = 0,
    PATCH = 1
}
export declare const enum GateProtocols {
    CLIENT_REQUEST_CONNECTOR = 0
}
