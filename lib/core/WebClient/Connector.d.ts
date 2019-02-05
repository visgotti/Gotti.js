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
    clientId: string;
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
    private areas;
    connection: Connection;
    private _previousState;
    constructor(options?: any);
    messageQueue: MessageQueue;
    connect(URL: any, auth?: any): void;
    requestListen(areaId: string, options?: any): void;
    leave(): void;
    sendSystemMessage(message: any): void;
    writeArea(areaId: string, options?: any): void;
    listenArea(areaId: string, options?: any): void;
    readonly hasJoined: boolean;
    removeAllListeners(): void;
    protected onJoin(sessionId: any, clientId: any, gameId: any, areaOptions: any): void;
    protected onMessageCallback(event: any): void;
    protected setState(areaId: string, encodedState: Buffer): void;
    protected patch(areaId: any, binaryPatch: any): void;
}
