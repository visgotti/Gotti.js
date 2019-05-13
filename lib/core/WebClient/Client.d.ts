import { Signal } from '@gamestdio/signals';
import { Connector } from './Connector';
import ClientSystem from './../System/ClientSystem';
import { Message } from './../MessageQueue';
export declare type JoinOptions = {
    retryTimes: number;
    requestId: number;
} & any;
import { ClientProcess } from '../Process/Client';
export declare class Client {
    private runningProcess;
    private processes;
    private inGate;
    private stateListeners;
    private systemStateHandlers;
    id?: string;
    onJoinGame: Signal;
    authenticated: boolean;
    options: any;
    gameTypes: Array<string>;
    gameRegions: Array<string>;
    private _messageQueue;
    private joinedGame;
    protected connector: Connector;
    protected requestId: number;
    protected hostname: string;
    private token;
    private gameProcesses;
    constructor(url: string, token: string);
    addGameProcess(gameType: any, process: ClientProcess): void;
    getConnectorData(gameType: any, options: any): Promise<{}>;
    joinGame(gameType: any, fps: any, gottiId?: any, host?: any, port?: any): Promise<{}>;
    private startGameProcess;
    clearGameProcess(): void;
    getGateData(): Promise<{}>;
    /**
     * When you finally join a game, you need to make one last mandatory request
     * which is to find your initial write area. This is the only time where the client
     * natively can send data directly requesting an area if you wanted. The connector server
     * class will receive the client, areaOptions, and clientOptions. There is no callback or promise
     * for this, from this point on you will communicate with the server through your Gotti systems.
     * You can either implement the onAreaWrite method in your systems or you can have a server system
     * send a custom system message to one of your client systems.
     * @param clientOptions - options to send to connector when getting initial area.
     */
    writeInitialArea(clientOptions?: any): void;
    private joinConnector;
    close(): void;
    /**
     * Gate
     * @param gateId
     * @param options
     */
    joinGate(options: any): void;
    private onMessage;
    /**
     * sends message over network to server
     * @param message - system message to be processed on server
     */
    sendSystemMessage(message: Message, limitEvery?: number): void;
    /**
     * sends message over network to server
     * @param message - system message to be processed on server
     */
    sendImmediateSystemMessage(message: Message): void;
    /**
     * Fired off when we receive a server message containing the system message protocol, will dispatch into the message queue.
     * @param message
     */
    private onServerSystemMessage;
    /**
     * Adds the system's onStateChange handler to be fired off for specific state path update
     * @param system
     * @param path
     */
    addSystemPathListener(system: ClientSystem, path: any): void;
    /**
     * Removes a system's onStateChange handler from a specific path.
     * @param systemName
     * @param path
     */
    removeSystemPathListener(systemName: string, path: string): void;
    /**
     * removes a system's onStateChange handler from any paths it was listening on.
     * gets called when you stop a system.
     * @param systemName
     */
    removeSystemHandler(systemName: string): void;
    /**
     * puts system into lookup if it's going to be handling state updates.
     * @param system
     */
    private initializeSystemStateHandler;
}
