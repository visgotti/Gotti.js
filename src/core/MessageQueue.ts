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

    private _systems: SystemLookup;
    private _messages: SystemMessageLookup;

    constructor() {
        this._systems = {} as SystemLookup;
        this._messages = {} as SystemMessageLookup;
    }

    get systems() {
        return this._systems;
    }
    get messages() {
        return this._messages;
    }

    public removeSystem(systemName) {
        this._messages[systemName].length = 0;
        delete this._messages[systemName];
        delete this._systems[systemName];
    }

    public removeAllSystemsAndMessages() {
        for(let systemName in this._systems) {
            delete this._systems[systemName];
            this._messages[systemName].length = 0;
            delete this._messages[systemName];
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
    }

    public add(message: Message) {
        for(let i = 0; i < message.to.length; i++) {
            this.messages[message.to[i]].push(message);
        }
    };

    public dispatch(systemName) {
        let i: number, system: System, msg: Message;

        for(i = 0; this._messages[systemName].length; i++){
            msg = this._messages[systemName][i];
            if(msg) {
                system = this._systems[systemName];
                if (system) {
                    system.onMessage(msg)
                }
            }
            this._messages[systemName].splice(i, 1);
            i--;
        }
    }
}