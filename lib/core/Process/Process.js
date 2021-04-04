"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityManager_1 = require("../EntityManager");
const Plugin_1 = require("../Plugin/Plugin");
var PROCESS_ENV;
(function (PROCESS_ENV) {
    PROCESS_ENV[PROCESS_ENV["CLIENT"] = 0] = "CLIENT";
    PROCESS_ENV[PROCESS_ENV["SERVER"] = 1] = "SERVER";
})(PROCESS_ENV = exports.PROCESS_ENV || (exports.PROCESS_ENV = {}));
const ClientMessageQueue_1 = require("../ClientMessageQueue");
const ServerMessageQueue_1 = require("../Server/ServerMessageQueue");
const SystemInitializer_1 = require("../System/SystemInitializer");
/**
 * globals - data or objects that can be used from any system
 * serverGameData - data that should contain information for systems that are dynamically driven ie weaponStatsData
 */
class Process {
    constructor(processEnv, globals = {}, plugins = []) {
        this.$api = {};
        this.apiSystemLookup = {};
        this.pluginInit = [];
        this.globals = globals;
        this.processEnv = processEnv;
        this.systems = {};
        this.systemNames = [];
        this.systemInitializedOrder = new Map();
        this.startedSystems = [];
        this._serverGameData = {};
        this.stoppedSystems = [];
        this.messageQueue = processEnv === PROCESS_ENV.SERVER ? new ServerMessageQueue_1.ServerMessageQueue() : new ClientMessageQueue_1.ClientMessageQueue();
        this.entityManager = new EntityManager_1.EntityManager(this.systems, this.globals);
        this.initializerFactory = processEnv === PROCESS_ENV.SERVER ? SystemInitializer_1.server : SystemInitializer_1.client;
    }
    addGlobal(key, value) {
        this.globals[key] = value;
    }
    installPlugin(iPlugin, systemNames) {
        let foundPlugin = this.pluginInit.find(p => iPlugin.name === p.plugin.name);
        const plugin = foundPlugin ? foundPlugin.plugin : new Plugin_1.Plugin(iPlugin, this.globals);
        if (!foundPlugin) {
            plugin.initialize();
        }
        if (!systemNames) {
            systemNames = [...this.systemNames];
        }
        const bufferedSystemNames = [...systemNames];
        // apply to started systems then buffer the rest
        let indexDiff = 0;
        for (let i = 0; i < systemNames.length; i++) {
            const system = this.systems[systemNames[i]];
            if (system) {
                plugin.applyToSystem(system);
                bufferedSystemNames.splice(i - indexDiff, 1);
                indexDiff++;
            }
        }
        if (foundPlugin) {
            foundPlugin.systems = [...foundPlugin.systems, ...bufferedSystemNames].filter((v, i, a) => a.indexOf(v) === i); // makes sure we dont duplicate system buffers
        }
        else {
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
    addSystem(SystemConstructor, ...args) {
        let system = new SystemConstructor(...args);
        if (this.systems[system.name]) {
            throw `Duplicate systen name ${system.name}`;
            return null;
        }
        system['installPlugin'] = (iPlugin) => {
            this.installPlugin(iPlugin);
        };
        this.systemInitializer(system);
        this.systems[system.name] = system;
        this.systemNames.push(system.name);
        // keep track of the order we initialized the systems in so when systems are stopped
        // and started we can keep track of only the needed names in order
        this.systemInitializedOrder.set(system.name, this.systemInitializedOrder.size);
        this.stoppedSystems.push(system);
        this.pluginInit.forEach(({ plugin, systems }) => {
            if (systems.includes(system.name)) {
                plugin.applyToSystem(system);
            }
        });
        return system;
    }
    _stopAllSystems() {
        for (let i = 0; i < this.systemNames.length; i++) {
            this._stopSystem(this.systemNames[i]);
        }
    }
    _stopSystem(system) {
        const foundStarted = (typeof system === 'string' || typeof system === 'number') ?
            this.startedSystems.find(s => s.name === system) :
            this.startedSystems.find(s => s.constructor === system);
        if (foundStarted) {
            this.messageQueue.removeSystem(foundStarted.name);
            foundStarted.onStop();
            for (let i = 0; i < this.startedSystems.length; i++) {
                if (this.startedSystems[i] === foundStarted) {
                    this.startedSystems.splice(i, 1);
                    break;
                }
            }
            const apiMethodsAdded = this.apiSystemLookup[foundStarted.name];
            if (apiMethodsAdded) {
                apiMethodsAdded.forEach(n => {
                    delete this.$api[n];
                });
                delete this.apiSystemLookup[foundStarted.name];
            }
            this.stoppedSystems.push(foundStarted);
        }
    }
    _startAllSystems() {
        for (let i = 0; i < this.systemNames.length; i++) {
            this._startSystem(this.systemNames[i]);
        }
    }
    _restartSystem(system) {
        const foundStarted = (typeof system === 'string' || typeof system === 'number') ?
            this.startedSystems.find(s => s.name === system) :
            this.startedSystems.find(s => s.constructor === system);
        if (foundStarted) {
            foundStarted.onRestart();
        }
        else {
            throw new Error(`Couldin't restart system ${system} since it wasn't started.`);
        }
    }
    _startSystem(system) {
        const foundStopped = (typeof system === 'string' || typeof system === 'number') ?
            this.stoppedSystems.find(s => s.name === system) :
            this.stoppedSystems.find(s => s.constructor === system);
        if (foundStopped) {
            this.messageQueue.addSystem(foundStopped);
            const systemName = foundStopped.name;
            const toStartInitializedIndex = this.systemInitializedOrder.get(systemName);
            // no started systems yet so no order to worry about, can just add
            if (this.startedSystems.length === 0) {
                this.startedSystems.push(this.systems[systemName]);
            }
            else {
                const lastStartedSystemName = this.startedSystems[this.startedSystems.length - 1].name;
                const lastStartedSystemInitializedIndex = this.systemInitializedOrder.get(lastStartedSystemName);
                // can just add it to end
                if (toStartInitializedIndex > lastStartedSystemInitializedIndex) {
                    this.startedSystems.push(this.systems[systemName]);
                }
                else {
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
        }
        else {
            throw new Error('Couldnt find system');
        }
    }
    tick(delta) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            const { update, name } = this.startedSystems[i];
            this.messageQueue.dispatch(name);
            this.startedSystems[i].update && this.startedSystems[i].update(delta);
        }
    }
    clear() {
        this._stopAllSystems();
        for (let i = 0; i < this.systemNames.length; i++) {
            this.systems[this.systemNames[i]].onClear();
        }
        this.systems = {};
        this.startedSystems.length = 0;
        this.stoppedSystems.length = 0;
        this.systemNames.length = 0;
        this.systemInitializedOrder = new Map();
    }
    addApi(system, method, name) {
        const isFunction = method && ({}.toString.call(method) === '[object Function]' || {}.toString.call(method) === '[object AsyncFunction]');
        if (!isFunction) {
            throw new Error('addApi must be called with a valid function to add as an api method');
        }
        name = name ? name : method.name;
        if (!name)
            throw new Error(`no name provided for api method ${method} from system ${system} if youre adding an anonynmous function to the api from a system you must supply a name as second parameter`);
        this.$api[name] = method.bind(system);
        if (!this.apiSystemLookup[system.name]) {
            this.apiSystemLookup[system.name] = [name];
        }
        else {
            this.apiSystemLookup[system.name].push(name);
        }
    }
}
exports.Process = Process;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
