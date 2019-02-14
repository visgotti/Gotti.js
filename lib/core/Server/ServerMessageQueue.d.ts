import ServerSystem from '../System/ServerSystem';
export interface Message {
    type: string | number;
    data: any;
    to: Array<string | number>;
    from?: string | number;
}
declare type ServerSystemMessageLookup = {
    [systemName: string]: Array<Array<string | Message>>;
};
declare type SystemMessageLookup = {
    [systemName: string]: Array<Message>;
};
declare type SystemLookup = {
    [systemName: string]: ServerSystem;
};
export declare class ServerMessageQueue {
    private systemNames;
    private _systems;
    private _messages;
    private _clientMessages;
    private _areaMessages;
    constructor();
    readonly systems: SystemLookup;
    readonly messages: SystemMessageLookup;
    readonly clientMessages: ServerSystemMessageLookup;
    readonly areaMessages: ServerSystemMessageLookup;
    removeSystem(systemName: any): void;
    removeAllSystemsAndMessages(): void;
    removeAllMessages(): void;
    addSystem(system: ServerSystem): void;
    add(message: Message): void;
    addClientMessage(clientId: any, message: Message): void;
    addAreaMessage(areaId: any, message: Message): void;
    /**
     * Adds message to every system even if they dont have a registered handler //TODO: possible inclusion/exclusion options in system
     * @param type
     * @param data
     * @param from
     */
    addAll(type: any, data: any, from: any): void;
    instantClientDispatch(clientId: any, message: Message): void;
    instantAreaDispatch(areaId: any, message: Message): void;
    /**
     * used for sending a message instantly to other systems versus waiting for next tick in the game loop.
     * @param message
     */
    instantDispatch(message: Message): void;
    /**
     * used for sending a message instantly to all other systems
     * @param message
     */
    instantDispatchAll(type: any, data: any, from: any): void;
    dispatch(systemName: any): void;
}
export {};
