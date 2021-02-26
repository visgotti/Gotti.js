import WebSocketClient from '@gamestdio/websocket';
import { IConnectorServerConnection } from './IConnectorServerConnection';
export declare class WebSocketConnection extends WebSocketClient implements IConnectorServerConnection {
    private _enqueuedCalls;
    constructor(url: any, autoConnect?: boolean);
    onMessage(cb: any): void;
    onOpen(cb: any): void;
    onOpenCallback(event: any): void;
    send(data: any): void;
}
