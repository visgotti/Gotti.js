"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = function server(process) {
    const createdSystems = new Set();
    const { messageQueue, entityManager, globals } = process;
    return (system) => {
        if (createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(messageQueue, entityManager, globals);
    };
};
exports.client = function client(process) {
    const createdSystems = new Set();
    const { messageQueue, entityManager, globals, client, isNetworked } = process;
    return (system) => {
        if (createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(client, messageQueue, entityManager, isNetworked, globals);
    };
};
