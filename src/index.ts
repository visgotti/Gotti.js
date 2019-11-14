import  ServerSystem from './core/System/ServerSystem';
import  ClientSystem from './core/System/ClientSystem';

export { ServerSystem }
export { ClientSystem }
export { IPlugin } from './core/Plugin/Plugin';
export { ServerProcess } from './core/Process/Server';
export { ClientProcess } from './core/Process/Client';
export { ClientManager } from './core/ServerFrameworks/ClientManager';
export { Entity } from './core/Entity';
export { Component } from './core/Component';
import { Client, PublicApi} from './core/WebClient/Client';
export { Client };

export { Message } from './core/ClientMessageQueue';

const Gotti: PublicApi = {};
const setDefaultClientExport = function(client: Client) {
    // clear properties on Gotti in case we already had a client initialized
    Object.keys(Gotti).forEach(key => {
       delete Gotti[key];
    });
    Object.keys(client.publicApi).forEach(key => {
        Gotti[key] = client.publicApi[key];
        Object.defineProperty(Gotti, key, {
            writable: false
        });
    });
};
export { setDefaultClientExport };
export default Gotti;

export function isFunction(value) {
    return value && ({}.toString.call(value) === '[object Function]' || {}.toString.call(value) === '[object AsyncFunction]');
}


const getMethods = (obj) => {
    let properties = new Set()
    let currentObj = obj
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)));
    return [...properties.keys()].filter(isFunction);
}