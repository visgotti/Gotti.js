import {EntityManager} from "../EntityManager";

export enum PROCESS_ENV {
    CLIENT = 0,
    SERVER = 1,
}

import { MessageQueue, Message } from '../MessageQueue'
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import System from '../System/System';
import ClientSystem from '../System/ClientSystem';
import ServerSystem from '../System/ServerSystem';
import { client, server } from '../System/SystemInitializer';

export interface ISystem {
    new (...args: Array<any>): ClientSystem | ServerSystem
}

export type SystemLookup <T extends string | number>  = {
    [systemName: string]: ClientSystem | ServerSystem,
    [systemName: number]: ClientSystem | ServerSystem
}

/**
 * globals - data or objects that can be used from any system
 * serverGameData - data that should contain information for systems that are dynamically driven ie weaponStatsData
 */
export abstract class Process<T> {
    public messageQueue: MessageQueue | ServerMessageQueue;
    public entityManager: EntityManager;

    public globals: any;

    private _serverGameData: any;

    protected initializerFactory: (process: Process<any>) => (System) => void;
    protected systemInitializer: (System) => void;

    readonly processEnv: PROCESS_ENV;

    public systemInitializedOrder: Map<string | number, number>;

    private systemDecorator: (System) => void;

    public systems: SystemLookup<string | number>;
    public systemNames: Array<string | number>;

    public startedSystemsLookup: Set<string | number>;
    public startedSystems: Array<ServerSystem | ClientSystem>;

    public stoppedSystems: Set<string | number>;

    constructor(processEnv: PROCESS_ENV, globals={}) {
        this.globals = globals;
        this.processEnv = processEnv;
        this.systems = {} as SystemLookup<string | number>;
        this.systemNames = [] as Array<string>;

        this.systemInitializedOrder = new Map() as Map<string | number, number>;

        this.startedSystemsLookup = new Set() as Set<string | number>;
        this.startedSystems = [] as Array<ServerSystem | ClientSystem>;

        this._serverGameData = {};

        this.stoppedSystems = new Set() as Set<string | number>;

        this.messageQueue = processEnv === PROCESS_ENV.SERVER ? new ServerMessageQueue() : new MessageQueue();
        this.entityManager = new EntityManager(this.systems);
        this.initializerFactory = processEnv === PROCESS_ENV.SERVER ? server : client;
    }

    public addGlobal(key: string, value: any) {
        this.globals[key] = value;
    }

    set serverGameData(data) {
        this._serverGameData = data;
        this.startedSystems.forEach(system => {
            system.serverGameData = data;
        });
    }

    public addSystem(SystemConstructor: ISystem, ...args: Array<any>) : ServerSystem | ClientSystem {
        let system = new SystemConstructor(...args);

        if (this.systems[system.name]) {
            throw `Duplicate systen name ${system.name}`;
            return null;
        }

        this.systemInitializer(system);
        this.systems[system.name] = system;
        this.systemNames.push(system.name);

        // keep track of the order we initialized the systems in so when systems are stopped
        // and started we can keep track of only the needed names in order
        this.systemInitializedOrder.set(system.name, this.systemInitializedOrder.size);

        this.stoppedSystems.add(system.name);
        return system;
    }

    protected _stopAllSystems() {
        for(let i = 0; i < this.systemNames.length; i++) {
            this._stopSystem(this.systemNames[i]);
        }
    }

    protected _stopSystem(systemName) {
        if (this.startedSystemsLookup.has(systemName)) {
            this.systems[systemName].onStop();

            this.startedSystemsLookup.delete(systemName);

            for(let i = 0; i < this.startedSystems.length; i++) {
                if(this.startedSystems[i].name === systemName) {
                    this.startedSystems.splice(i, 1);
                    break;
                }
            }

            this.stoppedSystems.add(systemName);
        }
    }

    protected _startAllSystems() {
        for(let i = 0; i < this.systemNames.length; i++) {
            this._startSystem(this.systemNames[i]);
        }
    }

    protected _startSystem(systemName) {
        if (this.stoppedSystems.has(systemName)) {
            this.startedSystemsLookup.add(systemName);
            const toStartInitializedIndex = this.systemInitializedOrder.get(systemName);
            // no started systems yet so no order to worry about, can just add
            if(this.startedSystems.length === 0) {
                this.startedSystems.push(this.systems[systemName]);
            } else {
                const lastStartedSystemName = this.startedSystems[this.startedSystems.length - 1].name;
                const lastStartedSystemInitializedIndex = this.systemInitializedOrder.get(lastStartedSystemName);

                // can just add it to end
                if (toStartInitializedIndex > lastStartedSystemInitializedIndex) {
                    this.startedSystems.push(this.systems[systemName]);
                } else {
                    // find where it should be.
                    for (let i = 0; i < this.startedSystems.length; i++) {
                        const startedInitializedIndex = this.systemInitializedOrder.get(this.startedSystems[i].name);
                        // find where in order it should be.
                        if (startedInitializedIndex > toStartInitializedIndex) {
                            // add system in correct initialization order.
                            this.startedSystems.splice(i, 0, this.systems[systemName]);
                            break;
                        }
                    }
                }
            }
            this.systems[systemName].serverGameData = this._serverGameData;
            this.stoppedSystems.delete(systemName);
            this.systems[systemName].onStart();
        }
    }

    protected tick(delta) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            this.messageQueue.dispatch(this.startedSystems[i].name);
            this.startedSystems[i].update(delta);
        }
    }

    public abstract startLoop (framesPerSecond: number): void;
    public abstract stopLoop(): void;
}
