import ClientSystem from './ClientSystem';
import ServerSystem from './ServerSystem';

import { ServerProcess } from '../Process/Server';
import { ClientProcess } from '../Process/Client';

export const server = function server (process: ServerProcess, globalSystemVariables: any) : (system: ServerSystem) => void  {
    const createdSystems = new Set();
    const { messageQueue, room, state } = process;

    return (system: ServerSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(room, state, messageQueue, globalSystemVariables);
    };
};

export const client = function client (process: ClientProcess, globalSystemVariables: any) :  (system: ClientSystem) => void  {
    const createdSystems = new Set();
    const { messageQueue, client } = process;

    return (system: ClientSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(client, messageQueue, globalSystemVariables);
    }
};