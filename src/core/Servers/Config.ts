interface AreaRoom {
    id: string,
    areaConstructor: any,
    options: any, // sent to client in an { [areaId]: options } map when join
}

interface AreaServer {
    areaRooms: Array<AreaRoom>
}

interface GameConfig {
    connectorCount: number,  //how many connector servers you want to use.
    areaServers: Array<AreaServer>,
    port?: number, // port the connector server listens for web requests from
}

export interface Config {
    games: {[type: string]: GameConfig },
    connector_servers: Array<string>, // lists pool of connector servers
    area_servers: Array<string> // lists pool of area servers
    gate_server: string // gate server URI
}