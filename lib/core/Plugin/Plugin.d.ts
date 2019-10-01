import System from "../System/System";
declare type PluginMethod = (...args: any[]) => any;
declare type KeyValuePair = {
    [key: string]: any;
};
declare type PluginProps = () => any;
declare type PluginInit = () => any;
export interface IPlugin {
    name: string;
    props?: PluginProps;
    methods?: {
        [methodName: string]: PluginMethod;
    };
    init?: PluginInit;
}
export declare class Plugin {
    readonly name: string;
    propMethod: PluginProps;
    methods: {
        [methodName: string]: PluginMethod;
    };
    private _props;
    props: KeyValuePair;
    private systemPlugs;
    private propNames;
    private methodNames;
    initialize: Function;
    constructor(plugin: IPlugin);
    emit(eventName: any, payload: any): void;
    private applyProps;
    private applyMethods;
    applyToSystem(system: System): void;
}
export declare function installPlugin(system: System, plugin: Plugin): void;
export {};
