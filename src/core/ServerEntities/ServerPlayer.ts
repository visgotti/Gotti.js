import {Entity} from "../Entity";

import { GOTTI_SERVER_PLAYER } from "../EntityTypes";

export abstract class ServerPlayer extends Entity {
    public rpc;
    constructor(serverId: string | number, clientId: number) {
        super(serverId, GOTTI_SERVER_PLAYER);
    }
    public abstract initialize(data?: any) : void;

}