import { Connector } from './Connector';
import ClientSystem from './../System/ClientSystem';
import { MessageQueue, Message } from './../MessageQueue';
export declare type JoinOptions = {
    retryTimes: number;
    requestId: number;
} & any;
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
    messageQueue: MessageQueue;
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
     * sends message over network to server
     * @param message - system message to be processed on server
     * @param limitEvery - optional
     */
    send(message: Message, limitEvery?: number): void;
    joinRoom(roomId: any, options: any): void;
    /**
     * Sends a request to the server to start listening for messages and state updates from an area.
     * @param areaId - area Id requesting to start listening to
     * @param options - options that get passed to the area room
     */
    listenArea(areaId: any, options?: any): void;
    /**
     * Sends a request to the server to stop listening for messages and state updates from an area.
     * @param areaId
     * @param options
     */
    removeListenArea(areaId: any, options?: any): void;
    /**
     * Sends a request to the server to join an area, this doesnt change your listening status,
     * but it will cause the joined area to be your 'main' area and will be the area that processes
     * any messages the client sends with sendLocal.
     * @param areaId
     * @param options
     */
    joinArea(areaId: any, options?: any): void;
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
