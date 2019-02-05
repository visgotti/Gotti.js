"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Protocols;
(function (Protocols) {
    Protocols[Protocols["REMOTE_SYSTEM_MESSAGE"] = 14] = "REMOTE_SYSTEM_MESSAGE";
    Protocols[Protocols["GLOBAL_SYSTEM_MESSAGE"] = 17] = "GLOBAL_SYSTEM_MESSAGE";
    Protocols[Protocols["AREA_DATA"] = 18] = "AREA_DATA";
    Protocols[Protocols["GLOBAL_GAME_DATA"] = 20] = "GLOBAL_GAME_DATA";
    Protocols[Protocols["ADD_AREA_LISTEN"] = 21] = "ADD_AREA_LISTEN";
    Protocols[Protocols["REMOVE_AREA_LISTEN"] = 22] = "REMOVE_AREA_LISTEN";
    Protocols[Protocols["CHANGE_AREA_WRITE"] = 23] = "CHANGE_AREA_WRITE";
    Protocols[Protocols["STATE_UPDATES"] = 24] = "STATE_UPDATES";
})(Protocols || (Protocols = {}));
exports.default = Protocols;
