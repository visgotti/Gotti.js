import { Signal } from '@gamestdio/signals';
import { GameProcessSetup } from "./ProcessManager";
import { Connector } from './Connector';
import ClientSystem from './../System/ClientSystem';
import { Message } from '../ClientMessageQueue';
export declare type JoinOptions = {
    retryTimes: number;
    requestId: number;
} & any;
export declare type ServerGameOptions = {
    host: string;
    port: number;
    gottiId: string;
    clientId: number;
};
export declare class Client {
    private runningProcess;
    private processFactories;
    private inGate;
    private stateListeners;
    private systemStateHandlers;
    private processMessageHandlers;
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
    private authId;
    private processManager;
    constructor(url: string, gameProcessSetups: Array<GameProcessSetup>, disableWebRTC?: boolean);
    clearGame(): void;
    private validateServerOpts;
    updateServerGameData(data: any): void;
    authenticate(options?: any, tokenHeader?: string): Promise<unknown>;
    register(options?: any, tokenHeader?: string): Promise<unknown>;
    getGames(clientOptions?: any, token?: any): Promise<unknown>;
    joinOfflineGame(gameType: any, gameData?: any, areaData?: any): Promise<boolean>;
    joinGame(gameType: any, joinOptions?: any, token?: any, fps?: number): Promise<unknown>;
    private joinOnlineGame;
    joinInitialArea(clientOptions?: any): Promise<unknown>;
    /**
     * can dispatch process messages from within a client system using
     * this.dispatchProcessMessage()
     */
    onProcessMessage(messageName: string, handler: Function): void;
    removeProcessMessage(messageName: any): void;
    raiseMessage(messageName: any, payload: any): void;
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
