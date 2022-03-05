"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultClientExport = exports.Client = exports.ClientSystem = exports.ServerSystem = void 0;
const ServerSystem_1 = require("./core/System/ServerSystem");
exports.ServerSystem = ServerSystem_1.default;
const ClientSystem_1 = require("./core/System/ClientSystem");
exports.ClientSystem = ClientSystem_1.default;
var Server_1 = require("./core/Process/Server");
Object.defineProperty(exports, "ServerProcess", { enumerable: true, get: function () { return Server_1.ServerProcess; } });
var Client_1 = require("./core/Process/Client");
Object.defineProperty(exports, "ClientProcess", { enumerable: true, get: function () { return Client_1.ClientProcess; } });
var ClientManager_1 = require("./core/ServerFrameworks/ClientManager");
Object.defineProperty(exports, "ClientManager", { enumerable: true, get: function () { return ClientManager_1.ClientManager; } });
var Entity_1 = require("./core/Entity");
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return Entity_1.Entity; } });
var Component_1 = require("./core/Component");
Object.defineProperty(exports, "Component", { enumerable: true, get: function () { return Component_1.Component; } });
const Client_2 = require("./core/WebClient/Client");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return Client_2.Client; } });
const Gotti = {};
const setDefaultClientExport = function (client) {
    // clear properties on Gotti in case we already had a client initialized
    Object.keys(Gotti).forEach(key => {
        delete Gotti[key];
    });
    Object.keys(client.publicApi).forEach(key => {
        Gotti[key] = client.publicApi[key];
        Object.defineProperty(Gotti, key, {
            writable: false
        });
    });
};
exports.setDefaultClientExport = setDefaultClientExport;
exports.default = Gotti;
