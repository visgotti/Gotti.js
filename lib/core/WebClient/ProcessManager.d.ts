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
    }>;
    isNetworked: boolean;
    plugins?: Array<IPlugin>;
    globals?: any;
    fps?: number;
};
export declare class ProcessManager {
    private runningGameProcess;
    private runningGameProcessSetup;
    private runningAreaProcessSetup;
    private areaSystems;
    private currentArea;
    private startedAreaSystemConstructors;
    private gameProcessSetups;
    readonly client: Client;
    constructor(gameProcessSetups: Array<GameProcessSetup>, client: Client);
    private validateGameProcessSetups;
    changeAreaProcess(areaType: any, areaData: any): void;
    changeGameProcessSetup(gameType: any, gameOptions: any): Promise<ClientProcess>;
    clearAllProcesses(): void;
    initializeGame(gameType: any, gameOptions: any): Promise<ClientProcess>;
    startCurrentGameSystems(): void;
}
