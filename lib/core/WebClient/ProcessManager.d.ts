import { ClientProcess } from "../Process";
import { ISystem } from "../Process/Process";
import { Client } from "./Client";
import { IPlugin } from "../Plugin/Plugin";
export declare type GameProcessSetup = {
    type: string;
    systems: Array<ISystem>;
    areas: Array<{
        type: string;
        systems: Array<ISystem>;
        plugins?: Array<IPlugin>;
    }>;
    isNetworked: boolean;
    plugins?: Array<IPlugin>;
    globals?: any;
    fps?: number;
};
export declare class ProcessManager {
    private areaData;
    private systemNamesByArea;
    private startedAreaSystemCount;
    private runningGameProcess;
    private runningGameProcessSetup;
    private runningAreaProcessSetup;
    private areaSystems;
    private currentArea;
    private gameSystemConstructors;
    private startedAreaSystemConstructors;
    private gameProcessSetups;
    readonly client: Client;
    private systemConstructorNameToPrototypeName;
    constructor(gameProcessSetups: Array<GameProcessSetup>, client: Client);
    private validateGameProcessSetups;
    removeAreaSystems(areaId: any): void;
    startAreaSystems(areaId: any): void;
    setAreaWriteProcess(areaType: any, isInitial: any, areaJoinData: any, areaData: any): void;
    changeGameProcessSetup(gameType: any, gameData: any, areaData: any): Promise<ClientProcess>;
    clearAllProcesses(): void;
    initializeGame(gameType: any, gameData?: any, areaData?: any): Promise<ClientProcess>;
    startCurrentGameSystems(): void;
}
