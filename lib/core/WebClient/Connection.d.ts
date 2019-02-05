import WebSocketClient from '@gamestdio/websocket';
export declare class Connection extends WebSocketClient {
    private _enqueuedCalls;
    constructor(url: any, autoConnect?: boolean);
    onOpenCallback(event: any): void;
    send(data: any): void;
}
