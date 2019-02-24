//TODO: split this into server and client message queue

import ServerSystem from '../System/ServerSystem';

export interface Message {
    type: string | number,
    data: any,
    to: Array<string | number>
    from?: string | number,
}

type SystemName = string | number;
type ServerSystemMessageLookup = { [systemName: string]: Array<Array<string | Message>> }
type SystemMessageLookup = { [systemName: string]: Array<Message> }
type SystemLookup = { [systemName: string]: ServerSystem }

export class ServerMessageQueue {
    private engineSystemMessageGameSystemHooks = {};
    private systemNames: Array<string | number>;
    private _systems: SystemLookup;
    private _messages: SystemMessageLookup;
    private _clientMessages: ServerSystemMessageLookup;
    private _areaMessages: ServerSystemMessageLookup;

    constructor() {
        this._systems = {} as SystemLookup;
        this.systemNames = [];

        this._messages = {} as SystemMessageLookup;
        this._clientMessages = {} as ServerSystemMessageLookup;
        this._areaMessages = {} as ServerSystemMessageLookup;
    }

    get systems() {
        return this._systems;
    }

    get messages() {
        return this._messages;
    }

    get clientMessages() {
        return this._clientMessages;
    }

    get areaMessages() {
        return this._areaMessages;
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
                this._messages[listeningSystemNames[length]].push(message);
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
        delete this._clientMessages[systemName];
        delete this._areaMessages[systemName];
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
            this._clientMessages[systemName].length = 0;
            this._areaMessages[systemName].length = 0;

            delete this._messages[systemName];
            delete this._areaMessages[systemName];
            delete this._clientMessages[systemName];

            this.systemNames.length = 0;
        }
    }

    public removeAllMessages() {
        for(let systemName in this._systems) {
            this._messages[systemName].length = 0;
        }
    }

    public addSystem(system: ServerSystem) {
        this._systems[system.name] = system;
        this._messages[system.name] = [];
        this._clientMessages[system.name] = [];
        this._areaMessages[system.name] = [];
        this.systemNames.push(system.name);
    }

    public add(message: Message) {
        for (let i = 0; i < message.to.length; i++) {
            this._messages[message.to[i]].push(message);
        }
        this.gameSystemHook(message, this.engineSystemMessageGameSystemHooks[message.type]);
    }

    public addClientMessage(clientId, message: Message) {
        for(let i = 0; i < message.to.length; i++) {
            this._clientMessages[message.to[i]].push([clientId, message]);
        }
    };

    public addAreaMessage(areaId, message: Message) {
        for(let i = 0; i < message.to.length; i++) {
            this._areaMessages[message.to[i]].push([areaId, message]);
        }
    };

    /**
     * Adds message to every system even if they dont have a registered handler //TODO: possible inclusion/exclusion options in system
     * @param type
     * @param data
     * @param from
     */
    public addAll(type, data, from) {
        this.add({
            type,
            data,
            to: this.systemNames,
            from,
        });
    };

    public instantClientDispatch(clientId, message: Message) {
        const messageToLength = message.to.length;
        for(let i = 0; i < messageToLength; i++) {
            this._systems[message.to[i]].onClientMessage(clientId, message);
        }
    }

    public instantAreaDispatch(areaId, message: Message) {
        const messageToLength = message.to.length;
        for(let i = 0; i < messageToLength; i++) {
            this._systems[message.to[i]].onAreaMessage(areaId, message);
        }
    }

    /**
     * used for sending a message instantly to other systems versus waiting for next tick in the game loop.
     * @param message
     */
    public instantDispatch(message: Message) {
        const messageToLength = message.to.length;
        for(let i = 0; i < messageToLength; i++) {
            this._systems[message.to[i]].onLocalMessage(message);
        }
        this.gameSystemHook(message, this.engineSystemMessageGameSystemHooks[message.type]);
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

    public dispatch(systemName) {
        let i: number, system: ServerSystem, msg: Message, serverMsg: Array<string | Message>;

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

        for(i = 0; this._areaMessages[systemName].length; i++){
            serverMsg = this._areaMessages[systemName][i];
            if(serverMsg) {
                system = this._systems[systemName];
                if (system) {
                    system.onAreaMessage(serverMsg[0], serverMsg[1])
                }
            }
            this._areaMessages[systemName].splice(i, 1);
            i--;
        }

        for(i = 0; this._clientMessages[systemName].length; i++){
            serverMsg = this._clientMessages[systemName][i];
            if(serverMsg) {
                system = this._systems[systemName];
                if (system) {
                    system.onClientMessage(serverMsg[0], serverMsg[1])
                }
            }
            this._clientMessages[systemName].splice(i, 1);
            i--;
        }
    }
}