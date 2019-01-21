"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = function server(process) {
    return (system) => {
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
exports.client = function client(process) {
    const createdSystems = new Set();
    const { entityManager, gameState, messageQueue, client, interfaceManager } = process;
    return (system) => {
        if (createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(entityManager, gameState, messageQueue, client, interfaceManager);
    };
};
