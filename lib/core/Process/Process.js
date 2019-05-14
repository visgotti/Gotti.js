"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityManager_1 = require("../EntityManager");
var PROCESS_ENV;
(function (PROCESS_ENV) {
    PROCESS_ENV[PROCESS_ENV["CLIENT"] = 0] = "CLIENT";
    PROCESS_ENV[PROCESS_ENV["SERVER"] = 1] = "SERVER";
})(PROCESS_ENV = exports.PROCESS_ENV || (exports.PROCESS_ENV = {}));
const MessageQueue_1 = require("../MessageQueue");
const ServerMessageQueue_1 = require("../Server/ServerMessageQueue");
const SystemInitializer_1 = require("../System/SystemInitializer");
class Process {
    constructor(processEnv, globals = {}) {
        this.globals = globals;
        this.processEnv = processEnv;
        this.systems = {};
        this.systemNames = [];
        this.systemInitializedOrder = new Map();
        this.startedSystemsLookup = new Set();
        this.startedSystems = [];
        this.stoppedSystems = new Set();
        this.messageQueue = processEnv === PROCESS_ENV.SERVER ? new ServerMessageQueue_1.ServerMessageQueue() : new MessageQueue_1.MessageQueue();
        this.entityManager = new EntityManager_1.EntityManager(this.systems);
        this.initializerFactory = processEnv === PROCESS_ENV.SERVER ? SystemInitializer_1.server : SystemInitializer_1.client;
    }
    addGlobal(key, value) {
        this.globals[key] = value;
    }
    addSystem(SystemConstructor, ...args) {
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
    _stopAllSystems() {
        for (let i = 0; i < this.systemNames.length; i++) {
            this._stopSystem(this.systemNames[i]);
        }
    }
    _stopSystem(systemName) {
        if (this.startedSystemsLookup.has(systemName)) {
            this.systems[systemName].onStop();
            this.startedSystemsLookup.delete(systemName);
            for (let i = 0; i < this.startedSystems.length; i++) {
                if (this.startedSystems[i].name === systemName) {
                    this.startedSystems.splice(i, 1);
                    break;
                }
            }
            this.stoppedSystems.add(systemName);
        }
    }
    _startAllSystems() {
        for (let i = 0; i < this.systemNames.length; i++) {
            this._startSystem(this.systemNames[i]);
        }
    }
    _startSystem(systemName) {
        if (this.stoppedSystems.has(systemName)) {
            this.startedSystemsLookup.add(systemName);
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
            this.stoppedSystems.delete(systemName);
            this.systems[systemName].onStart();
        }
    }
    tick(delta) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            this.messageQueue.dispatch(this.startedSystems[i].name);
            this.startedSystems[i].update(delta);
        }
    }
}
exports.Process = Process;
