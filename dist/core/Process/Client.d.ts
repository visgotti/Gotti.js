import { Process } from './Process';
import { WebClient } from '../WebClient';
export declare abstract class ClientProcess extends Process<ClientProcess> {
    protected client: WebClient;
    constructor(client: WebClient);
    initialize(): void;
    startSystem(systemName: any): void;
    startAllSystems(): void;
    stopSystem(systemName: any): void;
    stopAllSystems(): void;
}
