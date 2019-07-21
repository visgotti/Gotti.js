import { Connection } from "./Connection";
export declare enum SocketType {
    UDP = 0,
    TCP = 1
}
export interface PeerConnectionConfig {
    iceServerURLs?: Array<string>;
    socketType?: SocketType;
}
import { Signal } from "@gamestdio/signals";
export declare class PeerConnection {
    readonly peerPlayerIndex: number;
    readonly clientPlayerIndex: number;
    readonly channelId: string;
    private connection;
    private config;
    private peerConnection;
    private dataChannel;
    onConnected: Signal;
    onDisconnected: Signal;
    connected: boolean;
    private connectOptions;
    constructor(connection: Connection, clientPlayerIndex: any, peerPlayerIndex: number, configOptions?: PeerConnectionConfig);
    private onDataChannelOpen;
    private setupDataChannel;
    handleSDPSignal(sdp: any): void;
    handleIceCandidateSignal(candidate: any): void;
    private handleLocalDescription;
    private handleInitialLocalDescription;
    private logError;
    private onIceCandidate;
    requestConnection(systemName: any, requestOptions?: any): void;
    /**
     * used for incoming signal requests
     */
    acceptConnection(responseData: any): void;
    private onConnectionClose;
    send(type: string | number, data: any, to: Array<string>, from?: string | number): void;
    onPeerMessage(handler: any): void;
    private _onPeerMessageHandler;
    private _onPeerMessage;
    destroy(): void;
}
