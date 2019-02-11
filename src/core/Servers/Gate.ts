import { Messenger as Requester, Broker } from 'gotti-reqres/dist';
import { GateProtocol } from './Protocol';
import { sortByProperty } from './Util';

export interface ConnectorData {
    URL: string,
    serverIndex: number,
    connectedClients: number,
    gameId: string;
    heartbeat?: Function;
}

export interface GameData {
    connectorsData: Array<ConnectorData>;
    id: string,
    type: string,
    region?: string,
    options?: any,
}

export interface GateConfig {
    gateURI: string,
    gamesData: Array<GameData>,
}

export class Gate {
    public urls = [];

    private connectorsByServerIndex: { [serverIndex: number]: ConnectorData } = {};
    private gamesByType: { [type: string]: GameData } = {};
    private gamesById: { [id: string]: GameData} = {};

    private requestBroker: Broker;
    private requester: Requester;

    // data sent to client when authenticated
    private availableGamesByType: Array<string>;

    private heartbeat: NodeJS.Timer = null;

    constructor(gateURI) {
        this.gateKeep = this.gateKeep.bind(this);
        this.gameRequested = this.gameRequested.bind(this);
        this.requestBroker = new Broker(gateURI, 'gate');

        this.requester = new Requester({
            id: 'gate_requester',
            brokerURI: gateURI,
            request: { timeout: 1000 }
        });
    }

    // TODO: refactor this and adding games
    public addConnector(URL, serverIndex, gameType) {
        this.connectorsByServerIndex[serverIndex] = {
            URL,
            serverIndex,
            gameId: gameType,
            heartbeat: () => {},
            connectedClients: 0,
        };

        this.createRequestsForConnector(serverIndex);

        this.gamesByType[gameType] = {
            id: gameType,
            type: gameType,
            connectorsData: [
                this.connectorsByServerIndex[serverIndex],
            ]
        };

        this.availableGamesByType = [gameType];
    }

    public initializeServer(config: GateConfig) {
        let formatted = this.formatGamesData(config.gamesData);

        this.gamesByType = formatted.gamesByType;
        this.gamesById = formatted.gamesById;
        this.availableGamesByType = formatted.availableGamesByType;
        this.connectorsByServerIndex = formatted.connectorsByServerIndex;
    }

    /**
     * Handles the request from a player for a certain game type. needs work
     * right now the reuest has gameId and then the gate server will
     * reserve a seat on a connector from the game with fewest connected clients
     * @param req
     * @param res
     * @returns {Response|undefined}
     */
    public async gameRequested(req, res) {
        if(!(req.user)) {
            return res.status(500).json({ error: 'unauthenticated' });
        }

        const validated = this.validateGameRequest(req);

        if(validated.error) {
            return res.status(validated.code).json(validated.error);
        }

        const { gameType, auth } = validated;

        const { URL, gottiId} = await this.matchMake(gameType, auth);

        if(URL) {
            return res.status(200).json({ URL, gottiId });
        } else {
            return res.status(500).json('Invalid request');
        }
    }

    private async matchMake(gameType, auth?) : Promise<any> {
        try {

            //todo: implement my req/res socket lib to send request to channel to reserve seat for client
            //let connected = await this.connectPlayer(connectorGateURI)
            // if(connected)
            // gets first element in connector since it's always sorted.
            const connectorData = this.gamesByType[gameType].connectorsData[0];
            const { URL, gottiId } = await this.addPlayerToConnector(connectorData.serverIndex, auth);
            return { URL, gottiId };
        } catch (err) {
            throw err;
        }
    }

    /**
     * Returns lowest valued gameId in map.
     * @param gamesById - Dictionary of available games for a certain game type
     */
    private defaultMatchMaker(gamesById: { [id: string]: GameData}) {
        // returns game id with smallest valued id
        let lowest = null;
        Object.keys(gamesById).forEach(gId => {
            if(lowest === null) {
                lowest = gId;
            } else {
                if(gId < lowest) {
                    lowest = gId;
                }
            }
        });
        if(lowest === null) {
            throw new Error('No available games were presented in the match maker.');
        }
        return lowest;
    }

    public gateKeep(req, res) {
        if(this.onGateKeepHandler(req, res)) {
            res.status(200).json({ games: this.gamesByType })
        } else {
            res.status(401).json('Error authenticating');
        }
    }
    public registerGateKeep(handler: (request, response) => any) {
        this.onGateKeepHandler = handler;
        this.onGateKeepHandler = this.onGateKeepHandler.bind(this);
    }
    private onGateKeepHandler(req, res) : any {
        return true
    }

    private validateGameRequest(req) : any {
        if(!(req.body) || !(req.body['gameType']) || !(req.body['gameType'] in this.gamesByType)) {
            return { error: 'Bad request', code: 400 }
        }
        return { gameType: req.body['gameType'], auth: req.user };
    }

    // gets connector for game type
    private getLeastPopulatedConnector(gameId) {
        const { connectorsData } = this.gamesById[gameId];
        const connectorData = connectorsData[0];
    }


    /**
     * Adds a player to the connector's count and then resorts the pool
     * @param serverIndex - server index that the connector lives on.
     */
    private async addPlayerToConnector(serverIndex, auth) : Promise<any> {
        const connectorData = this.connectorsByServerIndex[serverIndex];
        try {
            const { URL, gottiId } = await this.reserveRoom(serverIndex, auth);
            connectorData.connectedClients++;
            //sorts
         //   this.gamesById[connectorData.gameId].connectorsData.sort(sortByProperty('connectedClients'));
            return { URL, gottiId } ;
        } catch(err) {
            throw err;
        }
    }

    /**
     * Removes a player from the connector's count and then resorts the pool
     * @param serverIndex - server index that the connector lives on.
     */
    private removePlayerFromConnector(serverIndex) {
        const connectorData = this.connectorsByServerIndex[serverIndex];
        connectorData.connectedClients--;

        //sorts
        this.gamesById[connectorData.gameId].connectorsData.sort(sortByProperty('connectedClients'))
    }

    public startConnectorHeartbeat(interval=100000) {
        if(this.heartbeat) {
            this.stopConnectorHeartbeat();
        }
        this.heartbeat = setInterval(async() => {
            const heartbeats = Object.keys(this.connectorsByServerIndex).map(key => {
                return this.connectorsByServerIndex[key].heartbeat(1);
            });

            // https://stackoverflow.com/questions/31424561/wait-until-all-es6-promises-complete-even-rejected-promises/36115549#36115549

            Promise.all(heartbeats.map(hb => hb.catch(e => e)))
                .then(results => {
                    let resLen = results.length;
                    while (resLen--) {
                        if (!(results[resLen].error)) {
                        } else {
                            this.handleHeartbeatResponse(results[resLen]);
                        }
                    }
                })
        }, interval);
    }

    public stopConnectorHeartbeat() {
        clearTimeout(this.heartbeat);
    }

    private handleHeartbeatError(connector) {
    }

    private handleHeartbeatResponse(response) {
       const connectorData = this.connectorsByServerIndex[response[0]];
       if(connectorData.connectedClients !== response[1]) {
           console.warn('the connected clients on gate did not match the count on the connector ', connectorData);
           connectorData.connectedClients = response[1];
           this.gamesById[connectorData.gameId].connectorsData.sort(sortByProperty('connectedClients'))
       }
    }

    private formatGamesData(gamesData: Array<GameData>) : any {
        let gamesByType: any = {};
        let gamesById: any = {};
        let connectorsByServerIndex: any = {};

        let availableGamesByType = {};

        gamesData.forEach(g => {
            if(!(g.type in gamesByType)) {
                gamesByType[g.type] = [];
                availableGamesByType[g.type] = [];
            }
            if(g.id in gamesById) {
                throw new Error(`Multiple games with the same id: ${g.id}`);
            }

            availableGamesByType[g.type].push(g.id);
            gamesById[g.id] = g;
            gamesByType[g.type].push(g);

            g.connectorsData.forEach(c => {
                if(c.serverIndex in connectorsByServerIndex) {
                    throw new Error(`different games ${ connectorsByServerIndex[c.serverIndex].gameId } and ${g.id} are using the same connector ${c.serverIndex}`)
                }
                connectorsByServerIndex[c.serverIndex] = c;
            });
        });

        return  { gamesById, gamesByType, connectorsByServerIndex, availableGamesByType }
    }

    private getClientCountOnConnector(serverIndex) {
        return this.connectorsByServerIndex[serverIndex].connectedClients;
    }

    private getGameIdOfConnector(serverIndex) {
        return this.connectorsByServerIndex[serverIndex].gameId;
    }

    private createRequestsForConnector(connectorServerIndex) {
        let reqName = GateProtocol.RESERVE_PLAYER_SEAT + '-' + connectorServerIndex;
        this.requester.createRequest(reqName, `${connectorServerIndex}_responder`,);

        reqName = GateProtocol.HEARTBEAT + '-' + connectorServerIndex;
        this.requester.createRequest(reqName, `${connectorServerIndex}_responder`,);

        this.connectorsByServerIndex[connectorServerIndex].heartbeat = this.requester.requests[reqName].bind(this);
    }

    private async reserveRoom(connectorServerIndex, auth): Promise<any> {
        try {
            let reqName = GateProtocol.RESERVE_PLAYER_SEAT + '-' + connectorServerIndex;

            let result = await this.requester.requests[reqName](auth);

            if(result && result.URL && result.gottiId) {
                return result
            } else {
                throw new Error('Invalid response from connector room. Failed to connect.');
            }

        } catch(err) {
            throw err;
        }
    }
}