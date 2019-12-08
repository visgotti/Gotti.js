import ClientSystem from './ClientSystem';
import ServerSystem from './ServerSystem';

import { ServerProcess } from '../Process/Server';
import { ClientProcess } from '../Process/Client';

import { ClientMessageQueue } from '../ClientMessageQueue';

export const server = function server (process: ServerProcess) : (system: ServerSystem) => void  {
    const createdSystems = new Set();
    const { messageQueue, entityManager, globals, addApi, $api } = process;

    return (system: ServerSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.$api = $api;
        system.addApi = process.addApi.bind(process, system);
        system.initialize(messageQueue, entityManager, globals);
    };
};

export const client = function client (process: ClientProcess) :  (system: ClientSystem) => void  {
    const createdSystems = new Set();
    const { messageQueue, entityManager, globals, client, isNetworked, gottiId, clientId, addApi, $api } = process;

    return (system: ClientSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.$api = $api;
        system.addApi = process.addApi.bind(process, system);
        system.initialize(client, messageQueue, entityManager, isNetworked, globals, gottiId, clientId);
    }
};