import Clock = require('@gamestdio/clock');
import { Signal } from '@gamestdio/signals';
import { StateContainer } from '@gamestdio/state-listener';
import { Connection } from './Connection';
import { ClientProcess } from '../Process/Client';
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
    private messageQueue;
    private id;
    private gameId;
    private writeAreaId;
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
    private process;
    private areas;
    connection: Connection;
    private _previousState;
    constructor();
    connect(gottiId: string, connectorURL: any, process: ClientProcess, options?: any): Promise<{}>;
    joinInitialArea(options?: any): void;
    leave(): void;
    sendSystemMessage(message: any): void;
    sendImmediateSystemMessage(message: any): void;
    readonly hasJoined: boolean;
    removeAllListeners(): void;
    protected onJoin(areaOptions: any, joinOptions: any): void;
    protected onMessageCallback(event: any): void;
    protected setState(areaId: string, encodedState: Buffer): void;
    protected patch(areaId: any, binaryPatch: any): void;
    private buildEndPoint;
}
