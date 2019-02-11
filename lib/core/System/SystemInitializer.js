"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = function server(process, globalSystemVariables) {
    const createdSystems = new Set();
    const { messageQueue } = process;
    return (system) => {
        if (createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(messageQueue, globalSystemVariables);
    };
};
exports.client = function client(process, globalSystemVariables) {
    const createdSystems = new Set();
    const { messageQueue, client } = process;
    return (system) => {
        if (createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.initialize(client, messageQueue, globalSystemVariables);
    };
};
