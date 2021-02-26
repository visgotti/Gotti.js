import WebSocketClient from '@gamestdio/websocket';
import * as msgpack from '../msgpack';
import { IConnectorServerConnection } from './IConnectorServerConnection';

export class WebSocketConnection extends WebSocketClient implements IConnectorServerConnection {

    private _enqueuedCalls: any[] = [];
    constructor(url, autoConnect: boolean = true) {
        super(url, undefined, { connect: autoConnect  });
    }

    public onMessage(cb) {
        super.onmessage = (msg) => {
            cb(msgpack.decode(new Uint8Array(msg.data)));
        };
    }
    public onOpen(cb) {
        super.onopen = cb;
    }

    public onOpenCallback(event) {
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

    // websocket is always reliable.
    public send(data: any): void {
        if (this.ws.readyState === WebSocketClient.OPEN) {
            return super.send( msgpack.encode(data) );
        } else {
            // WebSocket not connected.
            // Enqueue data to be sent when readyState == OPEN
            this._enqueuedCalls.push(['send', [data]]);
        }
    }
}