/// <reference types="node" />
import Clock = require('@gamestdio/clock');
import { Signal } from '@gamestdio/signals';
import { StateContainer } from '@gamestdio/state-listener';
import { Connection } from './Connection';
import { PeerConnection } from "./PeerConnection";
import { ClientProcess } from '../Process/Client';
import { ProcessManager } from './ProcessManager';
export declare enum AreaStatus {
    NOT_IN = 0,
    LISTEN = 1,
    WRITE = 2
}
export interface Area {
    _previousState: any;
    status: AreaStatus;
    state: StateContainer;
    options: any;
    data: any;
    type: string;
}
export declare type ConnectorAuth = {
    gottiId: string;
    playerIndex: number;
    connectorURL: string;
};
export declare class Connector {
    private messageQueue;
    private id;
    private gameId;
    private writeAreaId;
    gottiId: string;
    playerIndex: number;
    sessionId: string;
    options: any;
    private areaData;
    clock: Clock;
    remoteClock: Clock;
    onJoinConnector: Signal;
    onEnabledP2P: Signal;
    onNewP2PConnection: Signal;
    onRemovedP2PConnection: Signal;
    onWrite: Signal;
    onListen: Signal;
    onRemoveListen: Signal;
    onStateChange: Signal;
    onMessage: Signal;
    onError: Signal;
    onLeave: Signal;
    onOpen: Signal;
    onInitialArea: Signal;
    private process;
    private areas;
    connection: Connection;
    peerConnections: {
        [playerIndex: number]: PeerConnection;
    };
    private pendingPeerRequests;
    readonly connectedPeerIndexes: Array<number>;
    private _previousState;
    private processManager;
    constructor();
    connect(connectorAuth: ConnectorAuth, process: ClientProcess, processManager: ProcessManager, areaData: any, options?: any): Promise<unknown>;
    private handlePeerConnectionRequest;
    private handleSignalData;
    requestPeerConnection(peerIndex: number, systemName: string | number, requestOptions: any, systemRequestCallback: any): void;
    stopAllPeerConnections(): void;
    stopPeerConnection(peerIndex: any): void;
    joinInitialArea(options?: any): void;
    disconnect(): void;
    sendPeerMessage(peerIndex: any, message: any): void;
    sendAllPeersMessage(message: any): void;
    sendPeersMessage(peerIndexes: Array<number>, message: any): void;
    sendSystemMessage(message: any): void;
    sendImmediateSystemMessage(message: any): void;
    readonly hasJoined: boolean;
    removeAllListeners(): void;
    protected onJoin(joinOptions: any): void;
    protected onMessageCallback(event: any): void;
    protected setState(areaId: string, encodedState: Buffer): void;
    protected patch(areaId: any, binaryPatch: any): void;
    private buildEndPoint;
    private handlePeerFailure;
    private setupPeerConnection;
}
