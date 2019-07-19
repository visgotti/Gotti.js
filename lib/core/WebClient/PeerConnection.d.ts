import { Connection } from "./Connection";
import { ClientProcess } from "../Process/Client";
export declare enum SocketType {
    UDP = 0,
    TCP = 1
}
export interface PeerConnectionConfig {
    iceServerURLs?: Array<string>;
    socketType?: SocketType;
}
export declare class PeerConnection {
    private config;
    private rtcPeerConnection;
    private dataChannel;
    private peerPlayerIndex;
    private clientPlayerIndex;
    readonly channelId: string;
    private registeredMessage;
    opened: boolean;
    private connection;
    private sentIce;
    private process;
    constructor(connection: Connection, process: ClientProcess, clientPlayerIndex: any, peerPlayerIndex: number, configOptions?: PeerConnectionConfig);
    sendSignal(desc: any): void;
    handleSDPSignal(sdp: any): void;
    handleIceCandidateSignal(candidate: any): void;
    private logError;
    startSignaling(): void;
    private onDataChannel;
    onDataChannelOpen(handler: any): void;
    private _onDataChannelOpen;
    private _onDataChannelOpenHandler;
    onDataChannelClose(handler: any): void;
    private _onDataChannelCloseHandler;
    private _onDataChannelClose;
    send(type: string | number, data: any, to: Array<string>, from?: string | number): void;
    onPeerMessage(handler: any): void;
    private _onPeerMessageHandler;
    private _onPeerMessage;
    destroy(): void;
}
