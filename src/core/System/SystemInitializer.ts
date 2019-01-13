import System from './System';

export const server = function server (process) : (System) => void  {
    const createdSystems = new Set();

    const { entityManager, gameState, messageQueue, serverRoom } = process;
    let initializedIndex = 0;
    return (system: System<any>) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(initializedIndex, entityManager, gameState, messageQueue, serverRoom);
    }
};

export const client = function client (process) :  (System) => void  {
    const createdSystems = new Set();

    const { entityManager, gameState, messageQueue, clientRoom, interfaceManager } = process;

    let initializedIndex = 0;
    return (system: System<any>) => {
        if(createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(initializedIndex, entityManager, gameState, messageQueue, clientRoom, interfaceManager);
    }
};