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
declare const EventEmitter: any;
export declare type PublicApi = {
    clearGame?: () => void;
    register?: (requestPayload?: any) => Promise<any>;
    getGames?: (requestPayload?: any) => Promise<any>;
    joinInitialArea?: (requestPayload?: any) => Promise<any>;
    joinGame?: () => Promise<{
        gameData: any;
        areaData: any;
    }>;
    onProcessMessage?: (messageName: string, handler: (any: any) => void) => void;
    removeProcessMessage?: (messageName: any) => void;
    authenticate?: (requestPayload: any) => Promise<any>;
    auth?: {
        [handlerName: string]: (requestPayload?: any) => Promise<any>;
    };
    authentication?: {
        [handlerName: string]: (requestPayload?: any) => Promise<any>;
    };
    gate?: {
        [handlerName: string]: (requestPayload?: any) => Promise<any>;
    };
    api?: {
        [handlerName: string]: (requestPayload?: any) => Promise<any>;
    };
};
export declare class Client extends EventEmitter {
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
    readonly publicApi: any;
    private auth;
    private gate;
    private api;
    private authId;
    private processManager;
    private webProtocol;
    constructor(gameProcessSetups: Array<GameProcessSetup>, hostname?: string, disableWebRTC?: boolean, webProtocol?: string);
    addAuthRoutes(names: any): void;
    addGateRoutes(names: any): void;
    addApiRoutes(names: any): void;
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
export {};
