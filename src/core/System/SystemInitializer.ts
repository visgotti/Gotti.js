import ClientSystem from './ClientSystem';
//import ServerSystem from './ServerSystem';

import { WebClient } from '../WebClient';

export const server = function server (process) : (system: any) => void  {
    return (system: any) => {

    };
    /*
    const createdSystems = new Set();

    const { entityManager, gameState, gameData, messageQueue, serverRoom } = process;

    return (system: System) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(entityManager, gameState, gameData, messageQueue, serverRoom);
    }
    */
};

export const client = function client (process) :  (system: ClientSystem) => void  {
    const createdSystems = new Set();
    const { entityManager, gameState, messageQueue, client, interfaceManager } = process;

    return (system: ClientSystem) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(entityManager, gameState, messageQueue, client, interfaceManager);
    }
};