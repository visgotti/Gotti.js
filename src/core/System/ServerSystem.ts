import System from "./System";
import { Component } from "../Component";
import { Client as WebClient } from '../WebClient/Client';
import { Message } from '../ClientMessageQueue';
import { ServerMessageQueue } from '../Server/ServerMessageQueue';
import { EntityManager } from '../EntityManager';
import { Entity } from '../Entity';

abstract class ServerSystem extends System {
    readonly name: string | number;

    public messageQueue: ServerMessageQueue;
    public areaId: string | number;

    constructor(name: string | number) {
        super(name);
    }

    public initialize(
        messageQueue: ServerMessageQueue,
        entityManager: EntityManager,
        globalSystemVariables: {[reference: string]: any})
    {
        if(globalSystemVariables && typeof globalSystemVariables === 'object') {
            this.globals = globalSystemVariables;
        }

        this.initializeEntity = entityManager.initializeEntity.bind(entityManager);
        this.destroyEntity = entityManager.destroyEntity.bind(entityManager);

        //  this.dispatchToClient = room.send;
        this.messageQueue = messageQueue;
        this.messageQueue.addSystem(this);
        this.dispatchLocal = messageQueue.add;

        //     this.dispatchRemote = room.relayMessageQueue;
        this.initialized = true;

        this._onInit();
    }

    public abstract onAreaMessage(areaId, message);
    public abstract onClientMessage(client, message);

    // optional
    public onMasterMessage?(message) : any | false;

    public dispatchToAreas(message: Message, toAreaIds?: Array<string>) {};
    public dispatchToClient(clientUid: string, message: Message) {};
    public dispatchToAllClients(message: Message) {};
    public dispatchToLocalClients(message: Message) {};
    public dispatchToMaster(message) {};
}

export default ServerSystem;