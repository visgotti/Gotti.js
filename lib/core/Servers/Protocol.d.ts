import { ConnectorClient } from './Connector/ConnectorClient';
export declare const WS_CLOSE_CONSENTED = 4000;
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
    AREA_PUBLIC_OPTIONS = 33,
    AREA_TO_AREA_SYSTEM_MESSAGE = 34,
    BAD_REQUEST = 50,
    WS_SERVER_DISCONNECT = 4201,
    WS_TOO_MANY_CLIENTS = 4202
}
export declare const enum GateProtocol {
    RESERVE_PLAYER_SEAT = "1",
    HEARTBEAT = "2"
}
export declare enum StateProtocol {
    SET = 0,
    PATCH = 1
}
export declare function decode(message: any): any;
export declare function send(client: ConnectorClient, message: any, encode?: boolean): void;
