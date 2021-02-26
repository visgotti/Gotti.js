export interface IConnectorServerConnection {
    enqueuedMessages?: Array<any>;
    close: (data?: any) => void;
    send: (data: any, reliable?: boolean) => void;
    onMessage: (cb: (data: any) => void) => void;
    onOpen: (cb: (data: any) => void) => void;
}
