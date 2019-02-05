import ClientSystem from './ClientSystem';
import ServerSystem from './ServerSystem';

import { WebClient } from '../WebClient';

export const server = function server (process: globalSystemVariables) : (system: any) => void  {
    const createdSystems = new Set();
    const { messageQueue, room, state } = process;

    return (system: ServerSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(room, state, messageQueue, globalSystemVariables);
    };
};

export const client = function client (process, globalSystemVariables) :  (system: ClientSystem) => void  {
    const createdSystems = new Set();
    const { messageQueue, client } = process;

    return (system: ClientSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(client, messageQueue, globalSystemVariables);
    }
};