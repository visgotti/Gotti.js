interface AreaRoom {
    id: string;
    areaConstructor: any;
    options: any;
}
interface AreaServer {
    areaRooms: Array<AreaRoom>;
}
interface GameConfig {
    connectorCount: number;
    areaServers: Array<AreaServer>;
    port?: number;
}
export interface Config {
    games: {
        [type: string]: GameConfig;
    };
    connector_servers: Array<string>;
    area_servers: Array<string>;
    gate_server: string;
}
export {};
