/// <reference types="node" />
import { BackChannel, BackMaster } from 'gotti-channels/dist';
import { EventEmitter } from 'events';
import { AreaClient as Client } from './AreaClient';
export declare enum LISTEN_REQUEST_FROM {
    SERVER = 0,
    CLIENT = 1
}
export interface BroadcastOptions {
    except: Client;
}
export declare type SystemMessage = {
    type: number | string;
    data: any;
    to: Array<number | string>;
    from: number | string;
};
export declare type AreaToAreaSystemMessage = {
    type: number | string;
    data: any;
    to: Array<number | string>;
    from: number | string;
    toAreaIds: Array<number | string>;
};
export declare class AreaRoom extends EventEmitter {
    publicOptions: any;
    readonly areaId: string | number;
    patchRate: number;
    gameLoopRate: number;
    areaChannel: BackChannel;
    masterChannel: BackMaster;
    metadata: any;
    clientsById: any;
    private _patchInterval;
    state: any;
    private gottiProcess;
    constructor(gottiProcess: any, areaId: any, publicOptions?: any);
    initializeAndStart(masterChannel: any, areaChannel: any): void;
    private startGottiProcess;
    protected addMessage(message: SystemMessage): void;
    protected addImmediateMessage(message: SystemMessage, isRemote: boolean): void;
    protected setState(state: any): void;
    /**
     * sends system message to all clients in the game.
     * @param message
     */
    dispatchToAllClients(message: SystemMessage): void;
    /**
     * sends system message to all clients who are listening to it
     * @param message
     */
    dispatchToLocalClients(message: SystemMessage): void;
    /**
     * sends system message to specific client.
     * @param client
     * @param message
     */
    dispatchToClient(client: Client, message: SystemMessage): void;
    dispatchToAreas(areaIds: Array<string>, message: SystemMessage): void;
    private _onConnectorMessage;
    private _onMessage;
    private _onGlobalMessage;
    private registerBackChannelMessages;
}
