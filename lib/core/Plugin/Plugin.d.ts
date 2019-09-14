declare type PluginMethod = (...args: any[]) => any;
declare type PluginProps = () => any;
interface Plugin {
    name: string;
    props?: PluginProps;
    methods?: {
        [methodName: string]: PluginMethod;
    };
}
declare class InstalledPlugin {
    readonly name: string;
    props: PluginProps;
    methods: {
        [methodName: string]: PluginMethod;
    };
    constructor(plugin: Plugin);
}
export declare function installPlugin(plugin: Plugin): InstalledPlugin;
export {};
