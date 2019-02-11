import { Config } from './Config';
import { AreaServer } from './Area/AreaServer';
import { fork } from 'child_process';
import * as path from 'path';
// import { Connector, Area, Gate } from './Processes';

interface ServerData {
    serverIndex: number ,
    URL: string
}

export class MasterServer  {

    private availableConnectorServers: Array <ServerData>;
    private availableAreaServers: Array<ServerData>;

    private gameConfigs: any = {};
    private gamesInProgress: any = {};

    private gateURI: string;

    private gameId: number = 0;


    private formattedConnectorOptions: any = {};
    private formattedAreaServerOptions: any = {};
    private formattedGateOptions: any = {};

    constructor(config) {
        let serverIndex = 0;

        this.gateURI = config.gate_server;

        this.availableConnectorServers= config.connector_servers.map(URL => {
            return {
                URL,
                serverIndex: serverIndex++
            }
        });

        this.availableAreaServers= config.area_servers.map(URL => {
            return {
                URL,
                serverIndex: serverIndex++
            }
        });

        this.gameConfigs = config.games;
        this.gamesInProgress = {};
    }

    public startArea(areaConfig) {
        const area = new AreaServer(areaConfig);
        return area;
    }

    /**
     * Takes original config file
     * and creates config options for each
     * room based on state of servers and original config.
     * @param gameType
     * @returns {{gateConfig: {}, areaConfigs: Array, connectorsConfig: Array}}
     */
    public initializeConfigs(gameType) {
        const connectorsConfig = [];
        const areaConfigs = [];

        const game = this.gameConfigs[gameType];
        if(!(game)) {
            throw 'invalid game type';
        }

        console.log('game was', game);

        const connectorsCount = game.connectorCount;
        if(connectorsCount > this.availableConnectorServers.length) {
            throw 'not enough connectors available to start game'
        }

        const areaServersCount = game.areaServers.length;
        if(areaServersCount > this.availableAreaServers) {
            throw 'not enough areas available to start game'
        }
        let connectorServersToUse = [];
        for(let i = 0; i < connectorsCount; i++) {
            connectorServersToUse.push(this.availableConnectorServers.pop())
        }

        let areaServersToUse = [];
        for(let i = 0; i < areaServersCount; i++) {
            areaServersToUse.push(this.availableAreaServers.pop())
        }

        let connectorURIs = connectorServersToUse.map(c => {
            return c.URL;
        });

        let areaURIs = areaServersToUse.map(a => {
            return a.URL;
        });

        let areaRoomIds = [];
        for(let i = 0; i < game.areaServers.length; i++) {
            const { serverIndex, URL } = areaServersToUse[i];
            areaConfigs.push({
                serverIndex,
                areaURI: URL,
                areas: [],
                connectorURIs: [...connectorURIs],
            });
            for(let j = 0; j < game.areaServers[i].areaRooms.length; j++) {
                areaRoomIds.push(game.areaServers[i].areaRooms[j].id);
                areaConfigs[areaConfigs.length - 1].areas.push(game.areaServers[i].areaRooms[j])
            }
        }

        for(let i = 0; i < game.connectorCount; i++) {
            const { serverIndex, URL } = connectorServersToUse[i];

            let options: any = {
                gateURI: this.gateURI,
                serverIndex,
                areaRoomIds,
                areaServerURIs: areaURIs,
                connectorURI: connectorURIs[i],
            };

            if(game.port) {
                options.port = game.port;
            }
            if(game.pingTimeout) {
                options.pingTimeout = game.pingTimeout
            }
            connectorsConfig.push(options);
        }

        let formattedConnectorData = [];
        while(formattedConnectorData.length < connectorsCount) {
            const { serverIndex, URL } = connectorServersToUse[formattedConnectorData.length];
            formattedConnectorData.push({
                URL,
                serverIndex,
                connectedClients: 0,
                gameId: this.gameId,
            })
        }

        const gateGameConfig = {
            connectorsData: formattedConnectorData,
            id: this.gameId,
            type: gameType,
        };

        return {
            gateGameConfig,
            areaConfigs,
            connectorsConfig
        }
    }

    private formatDataForAreaServers() {
    }

    private formatDataForConnectorServers() {
    }

    private formatDataForGateServer() {
    }

    public startGameRemotely(gameType) {
    }
}