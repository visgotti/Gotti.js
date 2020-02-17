import { Process } from './Process';
import { ClientManager } from '../ServerFrameworks/ClientManager';
import { ISystem } from './Process';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
interface ServerProcessOptions {
    fpsTickRate?: number;
}
export declare class ServerProcess extends Process<ServerProcess> {
    private gameloop;
    private room;
    clientManager: ClientManager;
    private fpsTickRate;
    messageQueue: ServerMessageQueue;
    constructor(ClientManagerConstructor: ISystem, globals?: any, options?: ServerProcessOptions);
    addRoom(room: any): void;
    private decorateSystemWithClientManagerFunctions;
    private decorateSystemWithRoomFunctions;
    startLoop(fps?: number): void;
    stopLoop(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
export {};
