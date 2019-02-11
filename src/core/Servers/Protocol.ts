const msgpack = require('notepack.io');

import * as WebSocket from 'ws';
//import { debugAndPrintError } from './Debug';
import { ConnectorClient } from './Connector/ConnectorClient';
export const WS_CLOSE_CONSENTED = 4000;

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
    AREA_PUBLIC_OPTIONS = 33,
    AREA_TO_AREA_SYSTEM_MESSAGE = 34,

        // Generic messages (50~60)
    BAD_REQUEST = 50,


        // WebSocket error codes
    WS_SERVER_DISCONNECT = 4201,
    WS_TOO_MANY_CLIENTS = 4202,
}

export const enum GateProtocol {
    // Gate Communication 61-70
    RESERVE_PLAYER_SEAT = '1',
    HEARTBEAT = '2',
}

export enum StateProtocol {
    SET = 0,
    PATCH = 1
}

export function decode(message: any) {
    try {
        message = msgpack.decode(Buffer.from(message));

    } catch (e) {
      //  debugAndPrintError(`message couldn't be decoded: ${message}\n${e.stack}`);
        return;
    }

    return message;
}

export function send(client: ConnectorClient, message: any, encode: boolean = true) {
    console.log('attempting to send... message', message);
    if (client.readyState === WebSocket.OPEN) {
        client.send((encode && msgpack.encode(message)) || message, { binary: true });
    }
}
