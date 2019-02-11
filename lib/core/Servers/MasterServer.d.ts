import { AreaServer } from './Area/AreaServer';
export declare class MasterServer {
    private availableConnectorServers;
    private availableAreaServers;
    private gameConfigs;
    private gamesInProgress;
    private gateURI;
    private gameId;
    private formattedConnectorOptions;
    private formattedAreaServerOptions;
    private formattedGateOptions;
    constructor(config: any);
    startArea(areaConfig: any): AreaServer;
    /**
     * Takes original config file
     * and creates config options for each
     * room based on state of servers and original config.
     * @param gameType
     * @returns {{gateConfig: {}, areaConfigs: Array, connectorsConfig: Array}}
     */
    initializeConfigs(gameType: any): {
        gateGameConfig: {
            connectorsData: any[];
            id: number;
            type: any;
        };
        areaConfigs: any[];
        connectorsConfig: any[];
    };
    private formatDataForAreaServers;
    private formatDataForConnectorServers;
    private formatDataForGateServer;
    startGameRemotely(gameType: any): void;
}
