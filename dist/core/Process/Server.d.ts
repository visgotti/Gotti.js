import { Process } from './Process';
export declare class Server extends Process<Server> {
    private room;
    constructor(room: any);
    initialize(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
