export const enum Protocol {
    // find connector related (1~9)
    CONNECTOR_URI = 2,
    CONNECTOR_URI_ERROR = 3,

        // connector-related (10~19)
    JOIN_CONNECTOR = 10,
    JOIN_CONNECTOR_ERROR = 11,
    LEAVE_CONNECTOR = 12,

        // area-related 20-29
    REQUEST_WRITE_AREA = 20,
    REQUEST_LISTEN_AREA = 21,

    WRITE_AREA_ERROR = 22,
    LISTEN_AREA_ERROR = 23,

    REQUEST_REMOVE_LISTEN_AREA = 24,
    REQUEST_REMOVE_WRITE_AREA = 25,

    AREA_DATA = 26,
    AREA_STATE_UPDATE = 27,
    SYSTEM_MESSAGE = 28,

        //global messages 30 - 39
    GLOBAL_DATA = 30,
    GAME_STARTING = 31,
    GAME_ENDING = 32,

        // area to area communication
    AREA_TO_AREA_SYSTEM_MESSAGE,

        // Generic messages (50~60)
    BAD_REQUEST = 50,

        // WebSocket error codes
    WS_SERVER_DISCONNECT = 4201,
    WS_TOO_MANY_CLIENTS = 4202,
}

export enum StateProtocol {
    SET = 0,
    PATCH = 1
}

export const enum GateProtocols {
    CLIENT_REQUEST_CONNECTOR,
}

