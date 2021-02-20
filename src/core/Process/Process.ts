import {EntityManager} from "../EntityManager";

import { Plugin, IPlugin } from "../Plugin/Plugin";

export enum PROCESS_ENV {
    CLIENT = 0,
    SERVER = 1,
}

import { ClientMessageQueue, Message } from '../ClientMessageQueue'
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
    public messageQueue: ClientMessageQueue | ServerMessageQueue;
    public entityManager: EntityManager;

    public globals: any;
    public $api: {[methodNamme: string] : (...args: any[]) => any } = {};

    private _serverGameData: any;

    protected initializerFactory: (process: Process<any>) => (System) => void;
    protected systemInitializer: (System) => void;

    readonly processEnv: PROCESS_ENV;

    public systemInitializedOrder: Map<string | number, number>;

    private systemDecorator: (System) => void;

    public systems: SystemLookup<string | number>;
    public systemNames: Array<string | number>;

    public startedSystems: Array<ServerSystem | ClientSystem>;
    public stoppedSystems: Array<ServerSystem | ClientSystem>;

    private initializedPlugins: Array<Plugin>;

    private apiSystemLookup: {[name: string]: Array<string>} = {};

    private pluginInit: Array<{
        plugin: Plugin,
        systems: Array<string | number>
    }> = [];

    constructor(processEnv: PROCESS_ENV, globals={}, plugins=[]) {
        this.globals = globals;

        this.processEnv = processEnv;
        this.systems = {} as SystemLookup<string | number>;
        this.systemNames = [] as Array<string>;

        this.systemInitializedOrder = new Map() as Map<string | number, number>;
        this.startedSystems = [] as Array<ServerSystem | ClientSystem>;

        this._serverGameData = {};

        this.stoppedSystems = [];

        this.messageQueue = processEnv === PROCESS_ENV.SERVER ? new ServerMessageQueue() : new ClientMessageQueue();
        this.entityManager = new EntityManager(this.systems);
        this.initializerFactory = processEnv === PROCESS_ENV.SERVER ? server : client;
    }

    public addGlobal(key: string, value: any) {
        this.globals[key] = value;
    }

    public installPlugin(iPlugin: IPlugin, systemNames?: Array<string | number>) {
        let foundPlugin = this.pluginInit.find(p => iPlugin.name === p.plugin.name);

        const plugin = foundPlugin ? foundPlugin.plugin : new Plugin(iPlugin, this.globals);
        if(!foundPlugin) {
            plugin.initialize();
        }
        if(!systemNames) {
            systemNames = [...this.systemNames];
        }

        const bufferedSystemNames = [...systemNames];

        // apply to started systems then buffer the rest
        let indexDiff = 0;
        for(let i = 0; i < systemNames.length; i++) {
            const system = this.systems[systemNames[i]];
            if(system) {
                plugin.applyToSystem(system);
                bufferedSystemNames.splice(i - indexDiff, 1);
                indexDiff++;
            }
        }
        if(foundPlugin) {
            foundPlugin.systems = [...foundPlugin.systems, ...bufferedSystemNames].filter((v, i, a) => a.indexOf(v) === i); // makes sure we dont duplicate system buffers
        } else {
            this.pluginInit.push({ plugin, systems: bufferedSystemNames });
        }

        /*
        for(let i = 0; i < systemNames.length; i++) {
            const system = this.systems[systemNames[i]];
            if(!system) {
                throw new Error(`Trying to install plugin: ${plugin.name} on undefined system: ${systemNames[i]}`)
            }
            plugin.applyToSystem(system)
        }

         */
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

        system['installPlugin'] = (iPlugin: IPlugin) => {
            this.installPlugin(iPlugin)
        };

        this.systemInitializer(system);
        this.systems[system.name] = system;
        this.systemNames.push(system.name);

        // keep track of the order we initialized the systems in so when systems are stopped
        // and started we can keep track of only the needed names in order
        this.systemInitializedOrder.set(system.name, this.systemInitializedOrder.size);

        this.stoppedSystems.push(system);
        this.pluginInit.forEach(({ plugin, systems }) => {
            if(systems.includes(system.name)) {
                plugin.applyToSystem(system);
            }
        });
        return system;
    }

    protected _stopAllSystems() {
        for(let i = 0; i < this.systemNames.length; i++) {
            this._stopSystem(this.systemNames[i]);
        }
    }

    protected _stopSystem(system: string | number | ISystem) {
        const foundStarted = (typeof system === 'string' || typeof system === 'number') ?
            this.startedSystems.find(s => s.name === system) :
            this.startedSystems.find(s => s.constructor === system);

        if (foundStarted) {
            this.messageQueue.removeSystem(foundStarted.name);
            foundStarted.onStop();
            for(let i = 0; i < this.startedSystems.length; i++) {
                if(this.startedSystems[i] === foundStarted) {
                    this.startedSystems.splice(i, 1);
                    break;
                }
            }
            const apiMethodsAdded = this.apiSystemLookup[foundStarted.name];
            if(apiMethodsAdded) {
                apiMethodsAdded.forEach(n => {
                    delete this.$api[n];
                });
                delete this.apiSystemLookup[foundStarted.name];
            }
            this.stoppedSystems.push(foundStarted);
        }
    }

    protected _startAllSystems() {
        for(let i = 0; i < this.systemNames.length; i++) {
            this._startSystem(this.systemNames[i]);
        }
    }

    protected _restartSystem(system: string | number | ISystem) {
        const foundStarted = (typeof system === 'string' || typeof system === 'number') ?
            this.startedSystems.find(s => s.name === system) :
            this.startedSystems.find(s => s.constructor === system);

        if(foundStarted) {
            foundStarted.onRestart();
        } else {
            throw new Error(`Couldin't restart system ${system} since it wasn't started.`)
        }
    }

    protected _startSystem(system: string | number | ISystem) {
        const foundStopped = (typeof system === 'string' || typeof system === 'number') ?
            this.stoppedSystems.find(s => s.name === system) :
            this.stoppedSystems.find(s => s.constructor === system);

        if (foundStopped) {
            this.messageQueue.addSystem(foundStopped as any);
            const systemName = foundStopped.name;
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
            this.stoppedSystems.splice(this.stoppedSystems.indexOf(foundStopped), 1);
            this.systems[systemName].onStart();
        } else {
            throw new Error('Couldnt find system')
        }
    }

    protected tick(delta) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            const { update, name } = this.startedSystems[i];
            this.messageQueue.dispatch(name);
            this.startedSystems[i].update && this.startedSystems[i].update(delta);
        }
    }

    public clear() {
        this._stopAllSystems();
        for(let i = 0; i < this.systemNames.length; i++) {
            this.systems[this.systemNames[i]].onClear();
        }
        this.systems = {};
        this.startedSystems.length = 0;
        this.stoppedSystems.length = 0;
        this.systemNames.length = 0;
        this.systemInitializedOrder = new Map();
    }

    public addApi(system: System, method: (...args: any[]) => any, name?: string) {
        const isFunction = method && ({}.toString.call(method) === '[object Function]' || {}.toString.call(method) === '[object AsyncFunction]');
        if(!isFunction) {
            throw new Error('addApi must be called with a valid function to add as an api method')
        }
        name = name ? name : method.name;
        if(!name) throw new Error(`no name provided for api method ${method} from system ${system} if youre adding an anonynmous function to the api from a system you must supply a name as second parameter`);
        this.$api[name] = method.bind(system);
        if(!this.apiSystemLookup[system.name]) {
            this.apiSystemLookup[system.name] = [name];
        } else {
            this.apiSystemLookup[system.name].push(name);
        }
    }

    public abstract startLoop (framesPerSecond: number): void;
    public abstract stopLoop(): void;
}


function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
