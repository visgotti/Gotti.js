import System from './System/System';
export interface Message {
    type: string;
    data: any;
    to: Array<string>;
    from: string;
}
declare type SystemMessageLookup = {
    [systemName: string]: Array<Message>;
};
declare type SystemLookup = {
    [systemName: string]: System;
};
export declare class MessageQueue {
    static readToSendFormat(msg: Message): any[];
    private _systems;
    private _messages;
    private _remoteMessages;
    constructor();
    readonly systems: SystemLookup;
    readonly messages: SystemMessageLookup;
    readonly remoteMessages: SystemMessageLookup;
    removeSystem(systemName: any): void;
    removeAllSystemsAndMessages(): void;
    removeAllMessages(): void;
    addSystem(system: System): void;
    add(message: Message): void;
    addRemote(type: any, data: any, to: any, from: any): void;
    dispatch(systemName: any): void;
}
export {};
