export declare enum PROCESS_ENV {
    CLIENT = 0,
    SERVER = 1
}
import { MessageQueue } from '../MessageQueue';
import System from '../System/System';
import ClientSystem from '../System/ClientSystem';
import ServerSystem from '../System/ClientSystem';
interface ISystem {
    new (...args: Array<any>): ClientSystem | ServerSystem;
}
declare type SystemLookup = {
    [systemName: string]: System;
};
export declare abstract class Process<T> {
    messageQueue: MessageQueue;
    protected entityManager: any;
    protected gameState: any;
    protected interfaceManager?: any;
    protected initializerFactory: (process: Process<any>, globalVariables: any) => (System: any) => void;
    protected systemInitializer: (System: any) => void;
    systemInitializedOrder: Map<string | number, number>;
    private systemDecorator;
    systems: SystemLookup;
    systemNames: Array<string>;
    startedSystemsLookup: Set<string>;
    startedSystems: Array<System>;
    stoppedSystems: Set<string>;
    constructor(processEnv: PROCESS_ENV);
    protected addSystem(SystemConstructor: ISystem, ...args: Array<any>): void;
    protected _stopAllSystems(): void;
    protected _stopSystem(systemName: any): void;
    protected _startAllSystems(): void;
    protected _startSystem(systemName: any): void;
    protected tick(delta: any): void;
}
export {};
