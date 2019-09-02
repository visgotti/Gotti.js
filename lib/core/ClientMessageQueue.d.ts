import ClientSystem from "./System/ClientSystem";
export interface Message {
    type: string | number;
    data: any;
    to?: Array<string | number>;
    from?: string | number;
}
declare type SystemName = string | number;
declare type SystemMessageLookup = {
    [systemName: string]: Array<Message>;
};
declare type SystemLookup = {
    [systemName: string]: ClientSystem;
};
export declare class ClientMessageQueue {
    private engineSystemMessageGameSystemHooks;
    private systemNames;
    private _systems;
    private _messages;
    private _remoteMessages?;
    constructor();
    readonly systems: SystemLookup;
    readonly messages: SystemMessageLookup;
    readonly remoteMessages: SystemMessageLookup;
    /**
     * dispatches message to systems if there were any passed in.
     * @param type
     */
    private gameSystemHook;
    addGameSystemMessageListener(systemName: SystemName, messageType: string | number): void;
    removeGameSystemMessageListener(systemName: SystemName, messageType: string | number): boolean;
    removeSystem(systemName: any): void;
    removeAllSystemsAndMessages(): void;
    removeAllMessages(): void;
    addSystem(system: ClientSystem): void;
    add(message: Message): void;
    addAll(message: Message): void;
    /**
     * used for sending a message instantly to other systems versus waiting for next tick in the game loop.
     * @param message
     */
    instantDispatch(message: Message, isRemoteMessage?: boolean): void;
    /**
     * used for sending a message instantly to all other systems
     * @param message
     */
    instantDispatchAll(type: any, data: any, from: any): void;
    /**
     * Queues message to be handled in either the onClientMessage handler or onServerMessage system handler
     */
    addRemote(type: any, data: any, to: any, from: any): void;
    /**
     * Queues message to be handled on the onPeerMessage
     * @param systemName
     */
    dispatchPeerMessage(fromPeer: any, type: any, data: any, to: any, from: any): void;
    dispatch(systemName: any): void;
}
export {};
