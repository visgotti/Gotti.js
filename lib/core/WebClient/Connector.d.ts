/// <reference types="node" />
import Clock = require('@gamestdio/clock');
import { Signal } from '@gamestdio/signals';
import { StateContainer } from '@gamestdio/state-listener';
import { Connection } from './Connection';
import { MessageQueue } from '../MessageQueue';
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
}
export declare class Connector {
    private _messageQueue;
    private id;
    private gameId;
    gottiId: string;
    sessionId: string;
    options: any;
    clock: Clock;
    remoteClock: Clock;
    onJoinConnector: Signal;
    onWrite: Signal;
    onListen: Signal;
    onRemoveListen: Signal;
    onStateChange: Signal;
    onMessage: Signal;
    onError: Signal;
    onLeave: Signal;
    onOpen: Signal;
    private areas;
    connection: Connection;
    private _previousState;
    constructor();
    messageQueue: MessageQueue;
    connect(gottiId: string, connectorURL: any, options?: any): Promise<{}>;
    requestListen(areaId: string, options?: any): void;
    leave(): void;
    sendSystemMessage(message: any): void;
    writeArea(areaId: string, options?: any): void;
    listenArea(areaId: string, options?: any): void;
    readonly hasJoined: boolean;
    removeAllListeners(): void;
    protected onJoin(areaOptions: any, joinOptions: any): void;
    protected onMessageCallback(event: any): void;
    protected setState(areaId: string, encodedState: Buffer): void;
    protected patch(areaId: any, binaryPatch: any): void;
    private buildEndPoint;
}
