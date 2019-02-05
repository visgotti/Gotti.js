import System from './System/System';

export interface Message {
    type: string,
    data: any,
    to: Array<string>
    from: string,
}

type SystemMessageLookup = { [systemName: string]: Array<Message> }
type SystemLookup = { [systemName: string]: System }

export class MessageQueue {
    static readToSendFormat(msg: Message) {
        return [msg.type, msg.data, msg.to, msg.from];
    }

    private systemNames: Array<string>;
    private _systems: SystemLookup;
    private _messages: SystemMessageLookup;
    private _remoteMessages: SystemMessageLookup;

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
            this.messages[message.to[i]].push(message);
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

    /**
     * used for sending a message instantly to other systems versus waiting for next tick in the game loop.
     * @param message
     */
    public instantDispatch(message: Message) {
        for(let i = 0; i < message.to.length; i++) {
            this._systems[message.to[i]].onLocalMessage(message);
        }
    }
    /**
     * used for sending a message instantly to all other systems
     * @param message
     */
    public instantDispatchAll(type, data, from) {
        for(let i = 0; i < this.systemNames.length; i++) {
            this._systems[this.systemNames[i]].onLocalMessage(message);
        }
    }


    /**
     * Queues message to be handled in either the onClientMessage handler or onServerMessage system handler
     */
    public addRemote(type, data, to, from) {
        const message = {
            type,
            data,
            to,
            from,
        };

        for(let i = 0; i < message.to.length; i++) {
            this._remoteMessages[message.to[i]].push(message);
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