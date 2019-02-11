import { Connector } from './Connector';
import ClientSystem from './../System/ClientSystem';
import { Message } from './../MessageQueue';
export declare type JoinOptions = {
    retryTimes: number;
    requestId: number;
} & any;
import { ClientProcess } from '../Process/Client';
export declare class Client {
    private process;
    private inGate;
    private stateListeners;
    private systemStateHandlers;
    id?: string;
    authenticated: boolean;
    options: any;
    gameTypes: Array<string>;
    gameRegions: Array<string>;
    private _messageQueue;
    protected connector: Connector;
    protected requestId: number;
    protected hostname: string;
    private token;
    constructor(url: string, token: string);
    addProcess(process: ClientProcess): void;
    getGateData(): Promise<{}>;
    requestGame(gameType: any): Promise<{}>;
    joinConnector(gottiId: any, connectorURL: any): Promise<{}>;
    close(): void;
    /**
     * Gate
     * @param gateId
     * @param options
     */
    joinGate(options: any): void;
    private onMessage;
    /**
     * starts the process
     * @param fps - frames per second the game loop runs
     */
    startGame(fps?: number): void;
    stopGame(): void;
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
     * Gets initial area when first connected.
     * @param areaId
     * @param options
     */
    joinInitialArea(options?: any): void;
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
