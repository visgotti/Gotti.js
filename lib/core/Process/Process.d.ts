export declare enum PROCESS_ENV {
    CLIENT = 0,
    SERVER = 1
}
import { MessageQueue } from '../MessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import ClientSystem from '../System/ClientSystem';
import ServerSystem from '../System/ServerSystem';
export interface ISystem {
    new (...args: Array<any>): ClientSystem | ServerSystem;
}
declare type SystemLookup<T extends string | number> = {
    [systemName: string]: ClientSystem | ServerSystem;
    [systemName: number]: ClientSystem | ServerSystem;
};
export declare abstract class Process<T> {
    messageQueue: MessageQueue | ServerMessageQueue;
    globals: any;
    protected entityManager: any;
    protected gameState: any;
    protected interfaceManager?: any;
    protected initializerFactory: (process: Process<any>) => (System: any) => void;
    protected systemInitializer: (System: any) => void;
    readonly processEnv: PROCESS_ENV;
    systemInitializedOrder: Map<string | number, number>;
    private systemDecorator;
    systems: SystemLookup<string | number>;
    systemNames: Array<string | number>;
    startedSystemsLookup: Set<string | number>;
    startedSystems: Array<ServerSystem | ClientSystem>;
    stoppedSystems: Set<string | number>;
    constructor(processEnv: PROCESS_ENV, globals?: {});
    addGlobal(key: string, value: any): void;
    addSystem(SystemConstructor: ISystem, ...args: Array<any>): ServerSystem | ClientSystem;
    protected _stopAllSystems(): void;
    protected _stopSystem(systemName: any): void;
    protected _startAllSystems(): void;
    protected _startSystem(systemName: any): void;
    protected tick(delta: any): void;
    abstract startLoop(framesPerSecond: number): void;
    abstract stopLoop(): void;
}
export {};
