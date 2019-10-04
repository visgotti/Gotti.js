import System, { SystemPlug } from "../System/System";

const EventEmitter = require('eventemitter3');

type PluginMethod = (...args: any[]) => any;

type KeyValuePair = { [key: string]: any }

type PluginProps = () => any;
type PluginInit = () => any;
export interface IPlugin {
    name: string,
    props?: PluginProps;
    methods?:  {[methodName: string]: PluginMethod },
    init?: PluginInit
}

export class Plugin  {
    readonly name: string;
    public propMethod: PluginProps = null;
    public methods: {[methodName: string]: PluginMethod } = {};

    private _props: KeyValuePair = {};
    public props: KeyValuePair = {};

    private systemPlugs: Array<SystemPlug> = [];

    private propNames: Array<string> = [];
    private methodNames: Array<string> = [];
    private globals: any = {};
    public initialize: Function = () => {};
    constructor(plugin: IPlugin, globals?: any) {
        if(globals) {
            this.globals = globals;
        }
        this.name = plugin.name;
        const createProps = plugin.props ? plugin.props : null;
        const methods = plugin.methods ? plugin.methods : null;
        createProps && this.applyProps(createProps());
        methods && this.applyMethods(methods);
        if(plugin.hasOwnProperty('init')) {
            this.initialize = plugin.init;
        }
    }

    public emit (eventName, payload) {
        for(let i = 0; i < this.systemPlugs.length; i++) {
            this.systemPlugs[i].emit(eventName, payload);
        }
    }

    private applyProps(props) {
        const defPropProxy = (key) => {
            return {
                set: (v) => {
                    this._props[key] = v;
                },
                get: () => {
                    return this._props[key];
                }
            }
        }
    
        for(let key in props) {
            if(key in this) {
                if(this.propNames.includes(key)) {
                    throw new Error(`Duplicate prop name: ${key} in plugin: ${this.name}`)
                } else {
                    throw new Error(`Prop name: ${key} in plugin: ${this.name} cannot be used in a plugin`)
                }
            }
            this.propNames.push(key);
            this[key] = props[key];

            this._props[key] = props[key];
            this.props[key] = props[key];

            const propProxy = defPropProxy(key);

            Object.defineProperty(this, key, propProxy)
            Object.defineProperty(this.props, key, propProxy)
        }
    }

    private applyMethods(methods) {
        for(let key in methods) {
            if(key in this) {
                if(this.propNames.includes(key)) {
                    throw new Error(`Cannot use method name: ${key} because it is already used as a prop name in plugin: ${this.name}`)
                } else if(key in methods) {
                    throw new Error(`Duplicate method name: ${key} in plugin: ${this.name}`)
                } else {
                    throw new Error(`Method name: ${key} in plugin: ${this.name} cannot be used in a plugin`)
                }
            }
            const method = methods[key].bind(this)
            this.methodNames.push(key);
            this.methods[key] = method;
            this[key] = method;
        }
    }

    public applyToSystem(system: System) {
        for(let i = 0; i < this.propNames.length; i++) {
            const propName = this.propNames[i];
            if(system.$[propName]) {
                throw new Error(`Cannot add plugin prop ${propName} to system: ${system.name} because it was already defined`)
            }
            Object.defineProperty(system.$, propName, {
                get: () => {
                    return this._props[propName];
                },
                set: () => {
                    throw new Error(`System ${system.name} cannot set plugin prop: ${propName}, only the plugin ${this.name} can mutate the prop.`)
                }
            });
        }

        for(let i = 0; i < this.methodNames.length; i++) {
            const methodName = this.methodNames[i];
            if(system.$[methodName]) {
                throw new Error(`Cannot add plugin method ${methodName} to system: ${system.name} because it was already defined`)
            }
            system.$[methodName] = this.methods[methodName];
        }

        this.systemPlugs.push(system.$);
    }
}

export function installPlugin (system: System, plugin: Plugin) {
    plugin.applyToSystem(system);
}