import {ClientProcess} from "../Process";
import { ISystem } from "../Process/Process";
import {ClientSystem} from "../../index";
import {Client} from "./Client";
import {IPlugin} from "../Plugin/Plugin";

export type GameProcessSetup = {
    type: string,
    systems: Array<ISystem>,
    areas: Array<{
        type: string,
        systems: Array<ISystem>,
        plugins?: Array<IPlugin>
    }>,
    isNetworked: boolean,
    plugins?: Array<IPlugin>
    globals?: any;
    fps?: number,
}

export class ProcessManager {
    private areaData: any;
    private systemNamesByArea: { [areaType: string]: Array<string | number> } = {};
    private startedAreaSystemCount: { [systemName: string]: number } = {};
    private runningGameProcess: ClientProcess;
    private runningGameProcessSetup: GameProcessSetup;
    private runningAreaProcessSetup: { systems: Array<ISystem>, type: string };
    private areaSystems: { [areaName: string]: Array<ClientSystem> } = {};
    private currentArea: string;
    private gameSystemConstructors = [];
    private startedAreaSystemConstructors: Array<any> = [];
    private gameProcessSetups: Array<GameProcessSetup>;
    readonly client: Client;
    private systemConstructorNameToPrototypeName: any = {};

    constructor(gameProcessSetups: Array<GameProcessSetup>, client: Client) {
        this.validateGameProcessSetups(gameProcessSetups);
        this.gameProcessSetups = gameProcessSetups;
        this.client = client;
    }
    private validateGameProcessSetups(gameProcessSetups) {
        if(!Array.isArray(gameProcessSetups)) throw new Error(`game process files need to be an array`);
        const usedGameNames = {};
        const addedSystemConstructors = [];
        gameProcessSetups.forEach(gp => {
            if(!gp.type) throw new Error(`game process ${gp} needs a type string property`);
            if(gp.globals && (typeof gp.globals !== 'object' && typeof gp.globals !== 'function')) {
                console.log('globals was', typeof gp.globals);
                throw new Error(`gp.globals ${gp.type} must be an object or function/async function`);
            }
            if(usedGameNames[gp.type]) throw new Error(`${gp.type} already in use as a game type.`);
            if(!gp.systems || !Array.isArray(gp.systems)) {
                throw new Error(`game needs systems property to be array of ClientSystem instances for type: ${gp.type}`)
            }
            gp.systems.forEach(s => {
                if(!(s.prototype instanceof ClientSystem)) {
                    throw new Error(`game type system ${s} does not inherit from ClientSystem, make sure your systems array contains system constructors/classes, not objects.`)
                }
            });
            if(gp.areas && !Array.isArray(gp.areas)) {
                throw new Error(`game ${gp.type} areas need to be an array if included`);
            }
            if(gp.areas) {
                const usedGameAreasTypes = {};
                gp.areas.forEach(a => {
                    if(!a.type) throw new Error(`game process ${gp} area ${a} needs an type string property`);
                    if(usedGameAreasTypes[gp.type]) throw new Error(`${gp.type} already in use as a game type in game ${gp.type}.`);
                    usedGameNames[gp.type] = true;
                    if(!a.systems || !Array.isArray(a.systems)) throw `Area ${a.type} systems needs to be an array of systems`;
                    a.systems.forEach(s => {
                        if(gp.systems.includes(s)) {
                            throw new Error(`Area ${a} is using a duplicate system as the game process ${gp} if a game process uses a system, an area should not as well.`)
                        }
                        if(!(s.prototype instanceof ClientSystem)) {
                            throw new Error(`game type ${gp.type} area ${a.type} system ${s} does not inherit from ClientSystem, make sure your systems array contains system constructors/classes, not objects.`)
                        }
                    });
                })
            }
        });
    }

    public removeAreaSystems(areaId) {
        const systemNames = this.systemNamesByArea[this.areaData[areaId].type];
        for(let i = 0; i < systemNames.length; i++){
            const systemName = systemNames[i];
            this.startedAreaSystemCount[systemName]--;
            if(!this.startedAreaSystemCount[systemName]) {
                this.runningGameProcess.stopSystem(systemName)
            }
        }
    }

    public startAreaSystems(areaId) {
        const systemNames = this.systemNamesByArea[this.areaData[areaId].type];
        for(let i = 0; i < systemNames.length; i++){
            if(!this.startedAreaSystemCount[systemNames[i]]) {
                this.runningGameProcess.startSystem(systemNames[i]);
            } else {
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

    public async changeGameProcessSetup(gameType, gameData, areaData) {
        if(this.runningGameProcess) {
            this.clearAllProcesses();
        }
        return await this.initializeGame(gameType, gameData, areaData);
    }

    public clearAllProcesses() {
        this.runningGameProcess.clearGame();
        this.systemNamesByArea = {};
        this.startedAreaSystemCount = {};
        this.runningGameProcess = null;
        this.startedAreaSystemConstructors.length = 0;
        this.currentArea = "";
    }

    public async initializeGame(gameType, gameData?, areaData?) {
        const process = this.gameProcessSetups.find(p => p.type === gameType);
        if(!process) throw new Error(`Game ${gameType} was not found in processes.`);
        this.runningGameProcessSetup = process;
        this.areaData = areaData;
        let globals = {};
        if(process.globals) {
            if(typeof process.globals === "function") {
                globals = await process.globals(gameData, areaData, this.client);
            } else {
                globals = process.globals;
            }
        }
        const fps = process.fps ? process.fps : 60;
        this.runningGameProcess = new ClientProcess(this.client, process.isNetworked, globals, { fpsTickRate: fps });
        const addedSystemConstructors = [];

        process.systems.forEach(s => {
            const { name } = this.runningGameProcess.addSystem(s);
            this.systemConstructorNameToPrototypeName[s.name] = name;
        });
        process.areas.forEach(a => {
            this.systemNamesByArea[a.type] = [];
            a.systems.forEach(s => {
                // dont add systems that areas share
                if(!addedSystemConstructors.includes(s)) {
                    addedSystemConstructors.push(s);
                    const { name } = this.runningGameProcess.addSystem(s);
                    this.systemConstructorNameToPrototypeName[s.name] = name;
                }
                this.systemNamesByArea[a.type].push(this.systemConstructorNameToPrototypeName[s.name]);
                if(!this.startedAreaSystemCount[this.systemConstructorNameToPrototypeName[s.name]]) {
                    this.startedAreaSystemCount[this.systemConstructorNameToPrototypeName[s.name]] = 0;
                }
            });
        });

        if(process.plugins && Array.isArray(process.plugins)) {
            process.plugins.forEach(plugin => {
                this.runningGameProcess.installPlugin(plugin)
            })
        }

        return this.runningGameProcess;
    }

    public startProcess() {
        this.runningGameProcess.startLoop()
    }
    public stopProcess() {
        this.runningGameProcess.stopLoop();
    }

    public startCurrentGameSystems() {
        this.runningGameProcessSetup.systems.forEach(s => {
            this.runningGameProcess.startSystem(s);
        });
    }
}