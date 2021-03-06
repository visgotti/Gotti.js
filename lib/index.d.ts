import ServerSystem from './core/System/ServerSystem';
import ClientSystem from './core/System/ClientSystem';
export { ServerSystem };
export { ClientSystem };
export { IPlugin } from './core/Plugin/Plugin';
export { ServerProcess } from './core/Process/Server';
export { ClientProcess } from './core/Process/Client';
export { ClientManager } from './core/ServerFrameworks/ClientManager';
export { Entity } from './core/Entity';
export { Component } from './core/Component';
import { Client, PublicApi } from './core/WebClient/Client';
export { Client };
export { Message } from './core/ClientMessageQueue';
declare const Gotti: PublicApi;
declare const setDefaultClientExport: (client: Client) => void;
export { setDefaultClientExport };
export default Gotti;
