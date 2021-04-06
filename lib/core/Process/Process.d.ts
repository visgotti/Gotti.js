import { EntityManager } from "../EntityManager";
import { IPlugin } from "../Plugin/Plugin";
export declare enum PROCESS_ENV {
    CLIENT = 0,
    SERVER = 1
}
import { ClientMessageQueue } from '../ClientMessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import System from '../System/System';
import ClientSystem from '../System/ClientSystem';
import ServerSystem from '../System/ServerSystem';
export interface ISystem {
    new (...args: Array<any>): ClientSystem | ServerSystem;
}
export declare type SystemLookup<T extends string | number> = {
    [systemName: string]: ClientSystem | ServerSystem;
    [systemName: number]: ClientSystem | ServerSystem;
};
/**
 * globals - data or objects that can be used from any system
 * serverGameData - data that should contain information for systems that are dynamically driven ie weaponStatsData
 */
export declare abstract class Process<T> {
    messageQueue: ClientMessageQueue | ServerMessageQueue;
    entityManager: EntityManager;
    globals: any;
    $api: {
        [methodNamme: string]: (...args: any[]) => any;
    };
    private _serverGameData;
    protected initializerFactory: (process: Process<any>) => (System: any) => void;
    protected systemInitializer: (System: any) => void;
    readonly processEnv: PROCESS_ENV;
    systemInitializedOrder: Map<string | number, number>;
    private systemDecorator;
    systems: SystemLookup<string | number>;
    systemNames: Array<string | number>;
    startedSystems: Array<ServerSystem | ClientSystem>;
    stoppedSystems: Array<ServerSystem | ClientSystem>;
    private initializedPlugins;
    private apiSystemLookup;
    private pluginInit;
    constructor(processEnv: PROCESS_ENV, globals?: {}, plugins?: any[]);
    addGlobal(key: string, value: any): void;
    reset(data?: any): Promise<void>;
    installPlugin(iPlugin: IPlugin, systemNames?: Array<string | number>): void;
    serverGameData: any;
    addSystem(SystemConstructor: ISystem, ...args: Array<any>): ServerSystem | ClientSystem;
    protected _stopAllSystems(): void;
    protected _stopSystem(system: string | number | ISystem): void;
    protected _startAllSystems(): void;
    protected _restartSystem(system: string | number | ISystem): void;
    protected _startSystem(system: string | number | ISystem): void;
    protected tick(delta: any): void;
    clear(): void;
    addApi(system: System, method: (...args: any[]) => any, name?: string): void;
    abstract startLoop(framesPerSecond: number): void;
    abstract stopLoop(): void;
}
