import ClientSystem from './ClientSystem';
import ServerSystem from './ServerSystem';

import { ServerProcess } from '../Process/Server';
import { ClientProcess } from '../Process/Client';

import { MessageQueue } from '../MessageQueue';

export const server = function server (process: ServerProcess) : (system: ServerSystem) => void  {
    const createdSystems = new Set();
    const { messageQueue, entityManager, globals } = process;

    return (system: ServerSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(messageQueue, entityManager, globals);
    };
};

export const client = function client (process: ClientProcess) :  (system: ClientSystem) => void  {
    const createdSystems = new Set();
    const { messageQueue, entityManager, globals, client, isNetworked } = process;

    return (system: ClientSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(client,  messageQueue, entityManager, isNetworked, globals);
    }
};