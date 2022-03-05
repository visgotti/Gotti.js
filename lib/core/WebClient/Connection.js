"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const websocket_1 = require("@gamestdio/websocket");
const msgpack = require("./msgpack");
class Connection extends websocket_1.default {
    constructor(url, autoConnect = true) {
        super(url, undefined, { connect: autoConnect });
        this._enqueuedCalls = [];
    }
    onOpenCallback(event) {
        super.onOpenCallback();
        this.binaryType = 'arraybuffer';
        if (this._enqueuedCalls.length > 0) {
            for (const [method, args] of this._enqueuedCalls) {
                this[method].apply(this, args);
            }
            // clear enqueued calls.
            this._enqueuedCalls = [];
        }
    }
    send(data) {
        if (this.ws.readyState === websocket_1.default.OPEN) {
            return super.send(msgpack.encode(data));
        }
        else {
            // WebSocket not connected.
            // Enqueue data to be sent when readyState == OPEN
            this._enqueuedCalls.push(['send', [data]]);
        }
    }
}
exports.Connection = Connection;
