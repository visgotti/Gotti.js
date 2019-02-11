import { Process } from './Process';
import { ClientManager } from '../ServerFrameworks/ClientManager';
import { ISystem } from './Process';
export declare class ServerProcess extends Process<ServerProcess> {
    private gameloop;
    private room;
    clientManager: ClientManager;
    constructor(ClientManagerConstructor: ISystem, globalSystemVariables?: any);
    addRoom(room: any): void;
    private decorateSystemWithRoomFunctions;
    startLoop(fps?: number): void;
    stopLoop(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
