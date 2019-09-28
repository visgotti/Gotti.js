"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require('eventemitter3');
class Plugin {
    constructor(plugin) {
        this.propMethod = null;
        this.methods = {};
        this._props = {};
        this.props = {};
        this.systemPlugs = [];
        this.propNames = [];
        this.methodNames = [];
        this.name = plugin.name;
        const createProps = plugin.props ? plugin.props : null;
        const methods = plugin.methods ? plugin.methods : null;
        createProps && this.applyProps(createProps());
        methods && this.applyMethods(methods);
    }
    emit(eventName, payload) {
        for (let i = 0; i < this.systemPlugs.length; i++) {
            this.systemPlugs[i].emit(eventName, payload);
        }
    }
    applyProps(props) {
        const defPropProxy = (key) => {
            return {
                set: (v) => {
                    this._props[key] = v;
                },
                get: () => {
                    return this._props[key];
                }
            };
        };
        for (let key in props) {
            if (key in this) {
                if (this.propNames.includes(key)) {
                    throw new Error(`Duplicate prop name: ${key} in plugin: ${this.name}`);
                }
                else {
                    throw new Error(`Prop name: ${key} in plugin: ${this.name} cannot be used in a plugin`);
                }
            }
            this.propNames.push(key);
            this[key] = props[key];
            this._props[key] = props[key];
            this.props[key] = props[key];
            const propProxy = defPropProxy(key);
            Object.defineProperty(this, key, propProxy);
            Object.defineProperty(this.props, key, propProxy);
        }
    }
    applyMethods(methods) {
        for (let key in methods) {
            if (key in this) {
                if (this.propNames.includes(key)) {
                    throw new Error(`Cannot use method name: ${key} because it is already used as a prop name in plugin: ${this.name}`);
                }
                else if (key in methods) {
                    throw new Error(`Duplicate method name: ${key} in plugin: ${this.name}`);
                }
                else {
                    throw new Error(`Method name: ${key} in plugin: ${this.name} cannot be used in a plugin`);
                }
            }
            const method = methods[key].bind(this);
            this.methodNames.push(key);
            this.methods[key] = method;
            this[key] = method;
        }
    }
    applyToSystem(system) {
        for (let i = 0; i < this.propNames.length; i++) {
            const propName = this.propNames[i];
            if (system.$[propName]) {
                throw new Error(`Cannot add plugin prop ${propName} to system: ${system.name} because it was already defined`);
            }
            Object.defineProperty(system.$, propName, {
                get: () => {
                    return this._props[propName];
                },
                set: () => {
                    throw new Error(`System ${system.name} cannot set plugin prop: ${propName}, only the plugin ${this.name} can mutate the prop.`);
                }
            });
        }
        for (let i = 0; i < this.methodNames.length; i++) {
            const methodName = this.methodNames[i];
            if (system.$[methodName]) {
                throw new Error(`Cannot add plugin method ${methodName} to system: ${system.name} because it was already defined`);
            }
            system.$[methodName] = this.methods[methodName];
        }
        this.systemPlugs.push(system.$);
    }
}
exports.Plugin = Plugin;
function installPlugin(system, plugin) {
    plugin.applyToSystem(system);
}
exports.installPlugin = installPlugin;
