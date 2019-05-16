//TODO: split this into server and client message queue

import System from './System/System';

export interface Message {
    type: string | number,
    data: any,
    to?: Array<string | number>
    from?: string | number,
}


type SystemName = string | number;

type SystemMessageLookup = { [systemName: string]: Array<Message> }
type SystemLookup = { [systemName: string]: System }

export class MessageQueue {
    private engineSystemMessageGameSystemHooks = {};
    private systemNames: Array<string | number>;
    private _systems: SystemLookup;
    private _messages: SystemMessageLookup;
    private _remoteMessages?: SystemMessageLookup;

    constructor() {
        this._systems = {} as SystemLookup;
        this.systemNames = [];

        this._messages = {} as SystemMessageLookup;
        this._remoteMessages = {} as SystemMessageLookup;
    }

    get systems() {
        return this._systems;
    }

    get messages() {
        return this._messages;
    }

    get remoteMessages() {
        return this._remoteMessages;
    }

    /**
     * dispatches message to systems if there were any passed in.
     * @param type
     */
    private gameSystemHook(message, listeningSystemNames?: Array<SystemName>) {
        // if theres any registered game systems listening for this specific type of message...
        if(listeningSystemNames) {
            const length = listeningSystemNames.length;
            for(let i = 0; i < length; i++) {
                this._messages[listeningSystemNames[i]].push(message);
            }
        }
    }

    public addGameSystemMessageListener(systemName: SystemName, messageType: string | number) {
        if(!(messageType in this.engineSystemMessageGameSystemHooks)) {
            this.engineSystemMessageGameSystemHooks[messageType] = [];
        }
        this.engineSystemMessageGameSystemHooks[messageType].push(systemName);
    }

    public removeSystem(systemName) {
        this._messages[systemName].length = 0;
        delete this._messages[systemName];
        delete this._systems[systemName];

        const index = this.systemNames.indexOf(systemName);
        if(index >= 0) {
            this.systemNames.splice(index, 1);
        }
    }

    public removeAllSystemsAndMessages() {
        for(let systemName in this._systems) {
            delete this._systems[systemName];
            this._messages[systemName].length = 0;
            delete this._messages[systemName];

            this.systemNames.length = 0;

            this._remoteMessages[systemName].length = 0;
            delete this._remoteMessages[systemName];
        }
    }

    public removeAllMessages() {
        for(let systemName in this._systems) {
            this._messages[systemName].length = 0;
        }
    }

    public addSystem(system: System) {
        this._systems[system.name] = system;
        this._messages[system.name] = [];
        this._remoteMessages[system.name] = [];
        this.systemNames.push(system.name);
    }

    public add(message: Message) {
        for(let i = 0; i < message.to.length; i++) {
            if(!(message.to[i] in this._systems)) {
                console.error('trying to dispatch message', message.type, 'to a nonexistent system name', message.to[i]);
                continue;
            }
            this.messages[message.to[i]].push(message);
        }
        this.gameSystemHook(message, this.engineSystemMessageGameSystemHooks[message.type]);
    };

    public addAll(message: Message) {
        const systemsLength = this.systemNames.length;
        for(let i = 0; i < systemsLength; i++) {
            this.messages[this.systemNames[i]].push(message);
        }
    };

    /**
     * used for sending a message instantly to other systems versus waiting for next tick in the game loop.
     * @param message
     */
    public instantDispatch(message: Message, isRemoteMessage=false) {
        const messageToLength = message.to.length;
        if(isRemoteMessage) {
            for(let i = 0; i < messageToLength; i++) {
                if(!(message.to[i] in this._systems)) {
                    console.error('trying to dispatch message', message.type, 'to a nonexistent system name', message.to[i]);
                    continue;
                }
                this._systems[message.to[i]].onRemoteMessage(message);
            }
        } else {
            for(let i = 0; i < messageToLength; i++) {
                if(!(message.to[i] in this._systems)) {
                    console.error('trying to dispatch message', message.type, 'to a nonexistent system name', message.to[i]);
                    continue;
                }
                this._systems[message.to[i]].onLocalMessage(message);
            }
            this.gameSystemHook(message, this.engineSystemMessageGameSystemHooks[message.type]);
        }
    }
    /**
     * used for sending a message instantly to all other systems
     * @param message
     */
    public instantDispatchAll(type, data, from) {
        for(let i = 0; i < this.systemNames.length; i++) {
            this._systems[this.systemNames[i]].onLocalMessage({ type, data, to: [this.systemNames[i]], from});
        }
    }

    /**
     * Queues message to be handled in either the onClientMessage handler or onServerMessage system handler
     */
    public addRemote(type, data, to, from) {
        for(let i = 0; i < to.length; i++) {
            if(!(to[i] in this._systems)) {
                console.error('trying to dispatch message', type, 'to a nonexistent system name', to);
                continue;
            }
            this._remoteMessages[to[i]].push({ type, data, to, from });
        }
    }

    public dispatch(systemName) {
        let i: number, system: System, msg: Message;

        for(i = 0; this._messages[systemName].length; i++){
            msg = this._messages[systemName][i];
            if(msg) {
                system = this._systems[systemName];
                if (system) {
                    system.onLocalMessage(msg);
                }
            }
            this._messages[systemName].splice(i, 1);
            i--;
        }

        for(i = 0; this._remoteMessages[systemName].length; i++){
            msg = this._remoteMessages[systemName][i];
            if(msg) {
                system = this._systems[systemName];
                if (system) {
                    system.onRemoteMessage(msg)
                }
            }
            this._remoteMessages[systemName].splice(i, 1);
            i--;
        }
    }
}