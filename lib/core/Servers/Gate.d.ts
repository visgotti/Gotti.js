export interface ConnectorData {
    URL: string;
    serverIndex: number;
    connectedClients: number;
    gameId: string;
    heartbeat?: Function;
}
export interface GameData {
    connectorsData: Array<ConnectorData>;
    id: string;
    type: string;
    region?: string;
    options?: any;
}
export interface GateConfig {
    gateURI: string;
    gamesData: Array<GameData>;
}
export declare class Gate {
    urls: any[];
    private connectorsByServerIndex;
    private gamesByType;
    private gamesById;
    private requestBroker;
    private requester;
    private availableGamesByType;
    private heartbeat;
    constructor(gateURI: any);
    addConnector(URL: any, serverIndex: any, gameType: any): void;
    initializeServer(config: GateConfig): void;
    /**
     * Handles the request from a player for a certain game type. needs work
     * right now the reuest has gameId and then the gate server will
     * reserve a seat on a connector from the game with fewest connected clients
     * @param req
     * @param res
     * @returns {Response|undefined}
     */
    gameRequested(req: any, res: any): Promise<any>;
    private matchMake;
    /**
     * Returns lowest valued gameId in map.
     * @param gamesById - Dictionary of available games for a certain game type
     */
    private defaultMatchMaker;
    gateKeep(req: any, res: any): void;
    registerGateKeep(handler: (request: any, response: any) => any): void;
    private onGateKeepHandler;
    private validateGameRequest;
    private getLeastPopulatedConnector;
    /**
     * Adds a player to the connector's count and then resorts the pool
     * @param serverIndex - server index that the connector lives on.
     */
    private addPlayerToConnector;
    /**
     * Removes a player from the connector's count and then resorts the pool
     * @param serverIndex - server index that the connector lives on.
     */
    private removePlayerFromConnector;
    startConnectorHeartbeat(interval?: number): void;
    stopConnectorHeartbeat(): void;
    private handleHeartbeatError;
    private handleHeartbeatResponse;
    private formatGamesData;
    private getClientCountOnConnector;
    private getGameIdOfConnector;
    private createRequestsForConnector;
    private reserveRoom;
}
