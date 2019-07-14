"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("@gamestdio/websocket");
const msgpack = require("./msgpack");
class Connection extends websocket_1.default {
    constructor(url, isWebRTCSupported, autoConnect = true) {
        super(url, undefined, { connect: autoConnect });
        this._enqueuedCalls = [];
        this.isWebRTCSupported = isWebRTCSupported;
    }
    onOpenCallback(event) {
        super.onOpenCallback();
        this.binaryType = 'arraybuffer';
        if (this.isWebRTCSupported) {
            this.send(100 /* CLIENT_WEB_RTC_ENABLED */);
        }
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
