import { Process } from './Process';
import { ClientManager } from '../ServerFrameworks/ClientManager';
import { ISystem } from './Process';
export declare class ServerProcess extends Process<ServerProcess> {
    room: any;
    private gameloop;
    clientManager: ClientManager;
    constructor(ClientManagerConstructor: ISystem, room: any, globalSystemVariables?: any);
    startLoop(fps?: number): void;
    stopLoop(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
