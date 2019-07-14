import WebSocketClient from '@gamestdio/websocket';
export declare class Connection extends WebSocketClient {
    private _enqueuedCalls;
    private isWebRTCSupported;
    constructor(url: any, isWebRTCSupported: any, autoConnect?: boolean);
    onOpenCallback(event: any): void;
    send(data: any): void;
}
