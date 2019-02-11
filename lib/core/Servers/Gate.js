"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = require("gotti-reqres/dist");
const Util_1 = require("./Util");
class Gate {
    constructor(gateURI) {
        this.urls = [];
        this.connectorsByServerIndex = {};
        this.gamesByType = {};
        this.gamesById = {};
        this.heartbeat = null;
        this.gateKeep = this.gateKeep.bind(this);
        this.gameRequested = this.gameRequested.bind(this);
        this.requestBroker = new dist_1.Broker(gateURI, 'gate');
        this.requester = new dist_1.Messenger({
            id: 'gate_requester',
            brokerURI: gateURI,
            request: { timeout: 1000 }
        });
    }
    // TODO: refactor this and adding games
    addConnector(URL, serverIndex, gameType) {
        this.connectorsByServerIndex[serverIndex] = {
            URL,
            serverIndex,
            gameId: gameType,
            heartbeat: () => { },
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
    initializeServer(config) {
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
    gameRequested(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(req.user)) {
                return res.status(500).json({ error: 'unauthenticated' });
            }
            const validated = this.validateGameRequest(req);
            if (validated.error) {
                return res.status(validated.code).json(validated.error);
            }
            const { gameType, auth } = validated;
            const { URL, gottiId } = yield this.matchMake(gameType, auth);
            if (URL) {
                return res.status(200).json({ URL, gottiId });
            }
            else {
                return res.status(500).json('Invalid request');
            }
        });
    }
    matchMake(gameType, auth) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //todo: implement my req/res socket lib to send request to channel to reserve seat for client
                //let connected = await this.connectPlayer(connectorGateURI)
                // if(connected)
                // gets first element in connector since it's always sorted.
                const connectorData = this.gamesByType[gameType].connectorsData[0];
                const { URL, gottiId } = yield this.addPlayerToConnector(connectorData.serverIndex, auth);
                return { URL, gottiId };
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Returns lowest valued gameId in map.
     * @param gamesById - Dictionary of available games for a certain game type
     */
    defaultMatchMaker(gamesById) {
        // returns game id with smallest valued id
        let lowest = null;
        Object.keys(gamesById).forEach(gId => {
            if (lowest === null) {
                lowest = gId;
            }
            else {
                if (gId < lowest) {
                    lowest = gId;
                }
            }
        });
        if (lowest === null) {
            throw new Error('No available games were presented in the match maker.');
        }
        return lowest;
    }
    gateKeep(req, res) {
        if (this.onGateKeepHandler(req, res)) {
            res.status(200).json({ games: this.gamesByType });
        }
        else {
            res.status(401).json('Error authenticating');
        }
    }
    registerGateKeep(handler) {
        this.onGateKeepHandler = handler;
        this.onGateKeepHandler = this.onGateKeepHandler.bind(this);
    }
    onGateKeepHandler(req, res) {
        return true;
    }
    validateGameRequest(req) {
        if (!(req.body) || !(req.body['gameType']) || !(req.body['gameType'] in this.gamesByType)) {
            return { error: 'Bad request', code: 400 };
        }
        return { gameType: req.body['gameType'], auth: req.user };
    }
    // gets connector for game type
    getLeastPopulatedConnector(gameId) {
        const { connectorsData } = this.gamesById[gameId];
        const connectorData = connectorsData[0];
    }
    /**
     * Adds a player to the connector's count and then resorts the pool
     * @param serverIndex - server index that the connector lives on.
     */
    addPlayerToConnector(serverIndex, auth) {
        return __awaiter(this, void 0, void 0, function* () {
            const connectorData = this.connectorsByServerIndex[serverIndex];
            try {
                const { URL, gottiId } = yield this.reserveRoom(serverIndex, auth);
                connectorData.connectedClients++;
                //sorts
                //   this.gamesById[connectorData.gameId].connectorsData.sort(sortByProperty('connectedClients'));
                return { URL, gottiId };
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Removes a player from the connector's count and then resorts the pool
     * @param serverIndex - server index that the connector lives on.
     */
    removePlayerFromConnector(serverIndex) {
        const connectorData = this.connectorsByServerIndex[serverIndex];
        connectorData.connectedClients--;
        //sorts
        this.gamesById[connectorData.gameId].connectorsData.sort(Util_1.sortByProperty('connectedClients'));
    }
    startConnectorHeartbeat(interval = 100000) {
        if (this.heartbeat) {
            this.stopConnectorHeartbeat();
        }
        this.heartbeat = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const heartbeats = Object.keys(this.connectorsByServerIndex).map(key => {
                return this.connectorsByServerIndex[key].heartbeat(1);
            });
            // https://stackoverflow.com/questions/31424561/wait-until-all-es6-promises-complete-even-rejected-promises/36115549#36115549
            Promise.all(heartbeats.map(hb => hb.catch(e => e)))
                .then(results => {
                let resLen = results.length;
                while (resLen--) {
                    if (!(results[resLen].error)) {
                    }
                    else {
                        this.handleHeartbeatResponse(results[resLen]);
                    }
                }
            });
        }), interval);
    }
    stopConnectorHeartbeat() {
        clearTimeout(this.heartbeat);
    }
    handleHeartbeatError(connector) {
    }
    handleHeartbeatResponse(response) {
        const connectorData = this.connectorsByServerIndex[response[0]];
        if (connectorData.connectedClients !== response[1]) {
            console.warn('the connected clients on gate did not match the count on the connector ', connectorData);
            connectorData.connectedClients = response[1];
            this.gamesById[connectorData.gameId].connectorsData.sort(Util_1.sortByProperty('connectedClients'));
        }
    }
    formatGamesData(gamesData) {
        let gamesByType = {};
        let gamesById = {};
        let connectorsByServerIndex = {};
        let availableGamesByType = {};
        gamesData.forEach(g => {
            if (!(g.type in gamesByType)) {
                gamesByType[g.type] = [];
                availableGamesByType[g.type] = [];
            }
            if (g.id in gamesById) {
                throw new Error(`Multiple games with the same id: ${g.id}`);
            }
            availableGamesByType[g.type].push(g.id);
            gamesById[g.id] = g;
            gamesByType[g.type].push(g);
            g.connectorsData.forEach(c => {
                if (c.serverIndex in connectorsByServerIndex) {
                    throw new Error(`different games ${connectorsByServerIndex[c.serverIndex].gameId} and ${g.id} are using the same connector ${c.serverIndex}`);
                }
                connectorsByServerIndex[c.serverIndex] = c;
            });
        });
        return { gamesById, gamesByType, connectorsByServerIndex, availableGamesByType };
    }
    getClientCountOnConnector(serverIndex) {
        return this.connectorsByServerIndex[serverIndex].connectedClients;
    }
    getGameIdOfConnector(serverIndex) {
        return this.connectorsByServerIndex[serverIndex].gameId;
    }
    createRequestsForConnector(connectorServerIndex) {
        let reqName = "1" /* RESERVE_PLAYER_SEAT */ + '-' + connectorServerIndex;
        this.requester.createRequest(reqName, `${connectorServerIndex}_responder`);
        reqName = "2" /* HEARTBEAT */ + '-' + connectorServerIndex;
        this.requester.createRequest(reqName, `${connectorServerIndex}_responder`);
        this.connectorsByServerIndex[connectorServerIndex].heartbeat = this.requester.requests[reqName].bind(this);
    }
    reserveRoom(connectorServerIndex, auth) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let reqName = "1" /* RESERVE_PLAYER_SEAT */ + '-' + connectorServerIndex;
                let result = yield this.requester.requests[reqName](auth);
                if (result && result.URL && result.gottiId) {
                    return result;
                }
                else {
                    throw new Error('Invalid response from connector room. Failed to connect.');
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.Gate = Gate;
