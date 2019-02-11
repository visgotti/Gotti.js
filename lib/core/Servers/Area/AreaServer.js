"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AreaRoom_1 = require("./AreaRoom");
const dist_1 = require("gotti-channels/dist");
class AreaServer {
    constructor(options) {
        this.masterChannel = null;
        this.areas = {};
        this.masterChannel = new dist_1.BackMaster(options.serverIndex);
        this.masterChannel.initialize(options.areaURI, options.connectorURIs);
        const areaIds = options.areas.map(area => {
            return area.id;
        });
        this.masterChannel.addChannels(areaIds);
        options.areas.forEach(area => {
            this.masterChannel.backChannels[area.id].connectionOptions = area.options;
            const room = new AreaRoom_1.AreaRoom(area.process, area.id, area.options);
            room.initializeAndStart(this.masterChannel, this.masterChannel.backChannels[area.id]);
            this.areas[area.id] = room;
        });
    }
    startPatchingState() {
        this.masterChannel.setStateUpdateInterval();
    }
    disconnect() {
        this.masterChannel.disconnect();
        this.masterChannel = null;
        for (let areaId in this.areas) {
            delete this.areas[areaId];
        }
    }
}
exports.AreaServer = AreaServer;
