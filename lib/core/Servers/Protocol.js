"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const msgpack = require('notepack.io');
const WebSocket = require("ws");
exports.WS_CLOSE_CONSENTED = 4000;
var StateProtocol;
(function (StateProtocol) {
    StateProtocol[StateProtocol["SET"] = 0] = "SET";
    StateProtocol[StateProtocol["PATCH"] = 1] = "PATCH";
})(StateProtocol = exports.StateProtocol || (exports.StateProtocol = {}));
function decode(message) {
    try {
        message = msgpack.decode(Buffer.from(message));
    }
    catch (e) {
        //  debugAndPrintError(`message couldn't be decoded: ${message}\n${e.stack}`);
        return;
    }
    return message;
}
exports.decode = decode;
function send(client, message, encode = true) {
    console.log('attempting to send... message', message);
    if (client.readyState === WebSocket.OPEN) {
        client.send((encode && msgpack.encode(message)) || message, { binary: true });
    }
}
exports.send = send;
