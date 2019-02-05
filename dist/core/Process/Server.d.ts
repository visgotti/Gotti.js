import { Process } from './Process';
export declare class ServerProcess extends Process<ServerProcess> {
    room: any;
    state: any;
    constructor(room: any, state: any, globalSystemVariables: any);
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
