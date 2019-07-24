import { Connection } from "./Connection";
import { Signal } from "@gamestdio/signals";
export declare enum SocketType {
    UDP = 0,
    TCP = 1
}
export interface PeerConnectionConfig {
    iceServers?: Array<RTCIceServer>;
    socketType?: SocketType;
    timeout?: number;
    retries?: number;
    retryTimeout?: number;
}
export declare class PeerConnection {
    readonly peerPlayerIndex: number;
    readonly clientPlayerIndex: number;
    readonly channelId: string;
    private connection;
    private config;
    private last5Pings;
    private initiator;
    private pingInterval;
    private sentPingAt;
    private peerConnection;
    private dataChannel;
    onConnected: Signal;
    onDisconnected: Signal;
    onMessage: Signal;
    onMissedPing: Signal;
    connected: boolean;
    private ping;
    private missedPings;
    private seq;
    constructor(connection: Connection, clientPlayerIndex: number, peerPlayerIndex: number, configOptions?: PeerConnectionConfig);
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
    private startPinging;
    send(type: string | number, data: any, to: Array<string>, from?: string | number): void;
    private handlePong;
    private onPeerMessage;
    destroy(): void;
}
