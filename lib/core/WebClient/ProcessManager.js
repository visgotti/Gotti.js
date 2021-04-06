"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("../Process");
const index_1 = require("../../index");
class ProcessManager {
    constructor(gameProcessSetups, client) {
        this.systemNamesByArea = {};
        this.startedAreaSystemCount = {};
        this.areaSystems = {};
        this.gameSystemConstructors = [];
        this.startedAreaSystemConstructors = [];
        this.systemConstructorNameToPrototypeName = {};
        this.validateGameProcessSetups(gameProcessSetups);
        this.gameProcessSetups = gameProcessSetups;
        this.client = client;
    }
    validateGameProcessSetups(gameProcessSetups) {
        if (!Array.isArray(gameProcessSetups))
            throw new Error(`game process files need to be an array`);
        const usedGameNames = {};
        const addedSystemConstructors = [];
        gameProcessSetups.forEach(gp => {
            if (!gp.type)
                throw new Error(`game process ${gp} needs a type string property`);
            if (gp.globals && (typeof gp.globals !== 'object' && typeof gp.globals !== 'function')) {
                console.log('globals was', typeof gp.globals);
                throw new Error(`gp.globals ${gp.type} must be an object or function/async function`);
            }
            if (usedGameNames[gp.type])
                throw new Error(`${gp.type} already in use as a game type.`);
            if (!gp.systems || !Array.isArray(gp.systems)) {
                throw new Error(`game needs systems property to be array of ClientSystem instances for type: ${gp.type}`);
            }
            gp.systems.forEach(s => {
                if (!(s.prototype instanceof index_1.ClientSystem)) {
                    throw new Error(`game type system ${s} does not inherit from ClientSystem, make sure your systems array contains system constructors/classes, not objects.`);
                }
            });
            if (gp.areas && !Array.isArray(gp.areas)) {
                throw new Error(`game ${gp.type} areas need to be an array if included`);
            }
            if (gp.areas) {
                const usedGameAreasTypes = {};
                gp.areas.forEach(a => {
                    if (!a.type)
                        throw new Error(`game process ${gp} area ${a} needs an type string property`);
                    if (usedGameAreasTypes[gp.type])
                        throw new Error(`${gp.type} already in use as a game type in game ${gp.type}.`);
                    usedGameNames[gp.type] = true;
                    if (!a.systems || !Array.isArray(a.systems))
                        throw `Area ${a.type} systems needs to be an array of systems`;
                    a.systems.forEach(s => {
                        if (gp.systems.includes(s)) {
                            throw new Error(`Area ${a} is using a duplicate system as the game process ${gp} if a game process uses a system, an area should not as well.`);
                        }
                        if (!(s.prototype instanceof index_1.ClientSystem)) {
                            throw new Error(`game type ${gp.type} area ${a.type} system ${s} does not inherit from ClientSystem, make sure your systems array contains system constructors/classes, not objects.`);
                        }
                    });
                });
            }
        });
    }
    removeAreaSystems(areaId) {
        const systemNames = this.systemNamesByArea[this.areaData[areaId].type];
        for (let i = 0; i < systemNames.length; i++) {
            const systemName = systemNames[i];
            this.startedAreaSystemCount[systemName]--;
            if (!this.startedAreaSystemCount[systemName]) {
                this.runningGameProcess.stopSystem(systemName);
            }
        }
    }
    startAreaSystems(areaId) {
        const systemNames = this.systemNamesByArea[this.areaData[areaId].type];
        for (let i = 0; i < systemNames.length; i++) {
            if (!this.startedAreaSystemCount[systemNames[i]]) {
                this.runningGameProcess.startSystem(systemNames[i]);
            }
            else {
                this.runningGameProcess.restartSystem(systemNames[i]);
            }
            this.startedAreaSystemCount[systemNames[i]]++;
        }
    }
    /*
    public changeAreaWriteProcess(areaId, isInitial, areaJoinData) {
        if(!this.runningGameProcessSetup) throw new Error('Need to have a game process running before changing area process.');
        const areaType = this.areaData[areaId].type;
        if(!areaType) throw new Error(`Could not find area type for area id ${areaId}`);

        // restart all game-level systems (these are not the started systems of the current process, just the system constructors in the global gamem init
        this.runningGameProcessSetup.systems.forEach(s => {
            console.log('s.name was', s.name, 'and it mapped to', this.systemConstructorNameToPrototypeName[s.name]);
            console.log('all the system constructor to name prototypes was', this.systemConstructorNameToPrototypeName);
            this.runningGameProcess.restartSystem(this.systemConstructorNameToPrototypeName[s.name]);
        });

        const newAreaProcessSetup = this.runningGameProcessSetup.areas.find(a => a.type === areaType);
        if(!newAreaProcessSetup) {
            throw new Error(`${areaType} area type was not defined.`)
        }
        const newAreaSystemConstructors = [...newAreaProcessSetup.systems];
        // same area process no need to do besides restart all systems

        const copiedStartedAreaSystems = [...this.startedAreaSystemConstructors];
        for(let i = 0; i < copiedStartedAreaSystems.length; i++) {
            const systemConstructor = copiedStartedAreaSystems[i];
            const systemObjectName = this.systemConstructorNameToPrototypeName[systemConstructor.name];
            if(!newAreaSystemConstructors.includes(systemConstructor)) {
                console.log('DID NOT INCLUDE SYSTERM CONSTRUCTOR', systemConstructor);
                console.log('should be stopping system object name... expected to be 1:', this.startedAreaSystemCount[systemObjectName]);
                this.startedAreaSystemCount[systemObjectName]--;
                console.log('now expected to be 0:', this.startedAreaSystemCount[systemObjectName]);
                if(!this.startedAreaSystemCount[systemObjectName]) {
                    console.log('STOPPING THE SYSTEM!!!!')
                    this.runningGameProcess.stopSystem(systemObjectName)
                    this.startedAreaSystemConstructors.splice(this.startedAreaSystemConstructors.indexOf(systemConstructor), 1);
                }
            } else {
                this.runningGameProcess.restartSystem(systemObjectName);
                newAreaSystemConstructors.splice(newAreaSystemConstructors.indexOf(systemConstructor), 1);
            }
        }
        for(let i = 0; i < newAreaSystemConstructors.length; i++) {
            this.startedAreaSystemConstructors.push(newAreaSystemConstructors[i]);
            const systemObjectName = this.systemConstructorNameToPrototypeName[newAreaSystemConstructors[i].name];
            this.runningGameProcess.startSystem(newAreaSystemConstructors[i]);
            this.startedAreaSystemCount[systemObjectName]++;
        }
        this.runningGameProcess.dispatchOnAreaWrite(areaType, isInitial, areaJoinData);
    }
     */
    changeGameProcessSetup(gameType, gameData, areaData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.runningGameProcess) {
                this.clearAllProcesses();
            }
            return yield this.initializeGame(gameType, gameData, areaData);
        });
    }
    resetProcesses(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.runningGameProcess) {
                console.warn('No running game process to reset');
                return;
            }
            yield this.runningGameProcess.reset(data);
        });
    }
    clearAllProcesses() {
        this.runningGameProcess.clearGame();
        this.systemNamesByArea = {};
        this.startedAreaSystemCount = {};
        this.runningGameProcess = null;
        this.startedAreaSystemConstructors.length = 0;
        this.currentArea = "";
    }
    initializeGame(gameType, gameData, areaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const process = this.gameProcessSetups.find(p => p.type === gameType);
            if (!process)
                throw new Error(`Game ${gameType} was not found in processes.`);
            this.runningGameProcessSetup = process;
            this.areaData = areaData;
            let globals = {};
            if (process.globals) {
                if (typeof process.globals === "function") {
                    globals = yield process.globals(gameData, areaData, this.client);
                }
                else {
                    globals = process.globals;
                }
            }
            const fps = process.fps ? process.fps : 60;
            this.runningGameProcess = new Process_1.ClientProcess(this.client, process.isNetworked, globals, { fpsTickRate: fps });
            const addedSystemConstructors = [];
            process.systems.forEach(s => {
                const { name } = this.runningGameProcess.addSystem(s);
                this.systemConstructorNameToPrototypeName[s.name] = name;
            });
            process.areas.forEach(a => {
                this.systemNamesByArea[a.type] = [];
                a.systems.forEach(s => {
                    // dont add systems that areas share
                    if (!addedSystemConstructors.includes(s)) {
                        addedSystemConstructors.push(s);
                        const { name } = this.runningGameProcess.addSystem(s);
                        this.systemConstructorNameToPrototypeName[s.name] = name;
                    }
                    this.systemNamesByArea[a.type].push(this.systemConstructorNameToPrototypeName[s.name]);
                    if (!this.startedAreaSystemCount[this.systemConstructorNameToPrototypeName[s.name]]) {
                        this.startedAreaSystemCount[this.systemConstructorNameToPrototypeName[s.name]] = 0;
                    }
                });
            });
            if (process.plugins && Array.isArray(process.plugins)) {
                process.plugins.forEach(plugin => {
                    this.runningGameProcess.installPlugin(plugin);
                });
            }
            return this.runningGameProcess;
        });
    }
    startProcess() {
        this.runningGameProcess.startLoop();
    }
    stopProcess() {
        this.runningGameProcess.stopLoop();
    }
    startCurrentGameSystems() {
        this.runningGameProcessSetup.systems.forEach(s => {
            this.runningGameProcess.startSystem(s);
        });
    }
}
exports.ProcessManager = ProcessManager;
