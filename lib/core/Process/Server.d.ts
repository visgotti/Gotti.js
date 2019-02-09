import { Process } from './Process';
export declare class ServerProcess extends Process<ServerProcess> {
    room: any;
    state: any;
    private gameloop;
    constructor(room: any, state: any, globalSystemVariables?: any);
    startLoop(fps?: number): void;
    stopLoop(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
