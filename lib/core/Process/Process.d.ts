export declare enum PROCESS_ENV {
    CLIENT = 0,
    SERVER = 1
}
import { ClientManager } from '../ServerFrameworks/ClientManager';
import { MessageQueue } from '../MessageQueue';
import System from '../System/System';
import ClientSystem from '../System/ClientSystem';
import ServerSystem from '../System/ServerSystem';
export interface ISystem {
    new (...args: Array<any>): ClientSystem | ServerSystem | ClientManager;
}
declare type SystemLookup<T extends string | number> = {
    [systemName: string]: System;
    [systemName: number]: System;
};
export declare abstract class Process<T> {
    messageQueue: MessageQueue;
    protected entityManager: any;
    protected gameState: any;
    protected interfaceManager?: any;
    protected initializerFactory: (process: Process<any>, globalVariables: any) => (System: any) => void;
    protected systemInitializer: (System: any) => void;
    readonly processEnv: PROCESS_ENV;
    systemInitializedOrder: Map<string | number, number>;
    private systemDecorator;
    systems: SystemLookup<string | number>;
    systemNames: Array<string | number>;
    startedSystemsLookup: Set<string | number>;
    startedSystems: Array<System>;
    stoppedSystems: Set<string | number>;
    constructor(processEnv: PROCESS_ENV);
    addGlobal(key: string, value: any): void;
    addSystem(SystemConstructor: ISystem, ...args: Array<any>): System;
    protected _stopAllSystems(): void;
    protected _stopSystem(systemName: any): void;
    protected _startAllSystems(): void;
    protected _startSystem(systemName: any): void;
    protected tick(delta: any): void;
    abstract startLoop(framesPerSecond: number): void;
    abstract stopLoop(): void;
}
export {};
