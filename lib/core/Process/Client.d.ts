import { Process } from './Process';
import { Client as WebClient } from '../WebClient/Client';
export declare class ClientProcess extends Process<ClientProcess> {
    client: WebClient;
    constructor(client: WebClient, globalSystemVariables?: any);
    startLoop(fps?: number): void;
    stopLoop(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
