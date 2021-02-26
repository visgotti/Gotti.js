import { Signal } from "@gamestdio/signals";
import { Connector } from "./Connector";
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
    readonly doPingInterval: boolean;
    readonly peerPlayerIndex: number;
    readonly clientPlayerIndex: number;
    readonly channelId: string;
    private config;
    private queuedIceCandidates;
    private last5Pings;
    private initiator;
    private pingInterval;
    private sentPingAt;
    private peerConnection;
    dataChannel: RTCDataChannel;
    onAck: Signal;
    onConnected: Signal;
    onDisconnected: Signal;
    onMessage: Signal;
    onMissedPing: Signal;
    connected: boolean;
    private ping;
    private remoteDescriptionSet;
    private localDescriptionSet;
    private missedPings;
    private seq;
    gotAck: boolean;
    readonly connector: Connector;
    constructor(connector: Connector, clientPlayerIndex: number, peerPlayerIndex: number, configOptions?: PeerConnectionConfig);
    onDataChannelOpen(): void;
    private setupDataChannel;
    private applyQueuedIceCandidates;
    checkAck(): void;
    handleSDPSignal(sdp: any): void;
    readonly canApplyIce: boolean;
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
    send(message: any): void;
    private handlePong;
    onPeerMessage(event: any): void;
    destroy(): void;
}
