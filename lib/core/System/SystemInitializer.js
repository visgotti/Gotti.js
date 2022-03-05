"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.server = void 0;
exports.server = function server(process) {
    const createdSystems = new Set();
    const { messageQueue, entityManager, globals, addApi, $api } = process;
    return (system) => {
        if (createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.$api = $api;
        system.addApi = process.addApi.bind(process, system);
        system.initialize(messageQueue, entityManager, globals);
    };
};
exports.client = function client(process) {
    const createdSystems = new Set();
    const { messageQueue, entityManager, globals, client, isNetworked, gottiId, clientId, addApi, $api } = process;
    return (system) => {
        if (createdSystems.has(system.name)) {
            throw `Tried initializing duplicate system name: ${system.name} change of one of the instances.`;
        }
        system.$api = $api;
        system.addApi = process.addApi.bind(process, system);
        system.initialize(client, messageQueue, entityManager, isNetworked, globals, gottiId, clientId);
    };
};
