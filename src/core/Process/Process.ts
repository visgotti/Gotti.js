export enum PROCESS_ENV {
    CLIENT = 0,
    SERVER = 1,
}



import { MessageQueue, Message } from '../MessageQueue'
import System from '../System/System';
import ClientSystem from '../System/ClientSystem';
import ServerSystem from '../System/ClientSystem';
import { client, server } from '../System/SystemInitializer';

interface ISystem {
    new (...args: Array<any>): ClientSystem | ServerSystem
}

type SystemLookup <T extends string | number>  = {
    [systemName: string]: System,
    [systemName: number]: System
}

export abstract class Process<T> {
    public messageQueue: MessageQueue;

    // SHARED FRAMEWORKS
    protected entityManager: any;
    protected gameState: any;
    protected interfaceManager?: any;
    protected initializerFactory: (process: Process<any>, globalVariables: any) => (System) => void;
    protected systemInitializer: (System) => void;

    public systemInitializedOrder: Map<string | number, number>;

    private systemDecorator: (System) => void;

    public systems: SystemLookup<string | number>;
    public systemNames: Array<string | number>;

    public startedSystemsLookup: Set<string | number>;
    public startedSystems: Array<System>;

    public stoppedSystems: Set<string | number>;

    constructor(processEnv: PROCESS_ENV) {
        this.systems = {} as SystemLookup<string | number>;
        this.systemNames = [] as Array<string>;

        this.systemInitializedOrder = new Map() as Map<string | number, number>;

        this.startedSystemsLookup = new Set() as Set<string | number>;
        this.startedSystems = [] as Array<System>;

        this.stoppedSystems = new Set() as Set<string | number>;

        this.messageQueue = new MessageQueue();
        this.initializerFactory = processEnv === PROCESS_ENV.SERVER ? server : client;
    }

    public addSystem(SystemConstructor: ISystem, ...args: Array<any>) {
        let system = new SystemConstructor(...args);
        if (this.systems[system.name]) {
            throw `Duplicate systen name ${system.name}`;
            return;
        }

        this.systemInitializer(system);
        this.systems[system.name] = system;
        this.systemNames.push(system.name);

        // keep track of the order we initialized the systems in so when systems are stopped
        // and started we can keep track of only the needed names in order
        this.systemInitializedOrder.set(system.name, this.systemInitializedOrder.size);

        this.stoppedSystems.add(system.name);
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

}
