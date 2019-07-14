//TODO: split this into server and client message queue

import ClientSystem from "./System/ClientSystem";

export interface Message {
    type: string | number,
    data: any,
    to?: Array<string | number>
    from?: string | number,
}

type SystemName = string | number;

type SystemMessageLookup = { [systemName: string]: Array<Message> }
type PeerSystemMessageLookup = { [systemName: string]: Array<Message> }
type SystemLookup = { [systemName: string]: ClientSystem }

export class ClientMessageQueue {
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
        // dont allow duplicate hooks from the same system so do a check
        // addGameSystemMessageListener shouldnt be called really outside of the onInit
        // or very infrequently, so the loop shouldnt hinder performance anywhere.
        let length = this.engineSystemMessageGameSystemHooks[messageType];
        while(length--) {
            if(this.engineSystemMessageGameSystemHooks[messageType][length] === systemName) {
                throw new Error(`Duplicate message: ${messageType} listener for system: ${systemName} `);
            }
        }
        this.engineSystemMessageGameSystemHooks[messageType].push(systemName);
    }

    public removeGameSystemMessageListener(systemName: SystemName, messageType: string | number) {
        if(!(messageType in this.engineSystemMessageGameSystemHooks)) {
            throw new Error(`Trying to remove a message listener: ${messageType} from system: ${systemName} but the message was never listened to by any system`);
        } else {
            let length = this.engineSystemMessageGameSystemHooks[messageType].length;
            while(length--) {
                if(this.engineSystemMessageGameSystemHooks[messageType][length] === systemName) {
                    this.engineSystemMessageGameSystemHooks[messageType].splice(length, 1);
                    if(this.engineSystemMessageGameSystemHooks[messageType].length === 0) {
                        delete this.engineSystemMessageGameSystemHooks[messageType];
                    }
                    return true;
                }
            }
            // if it gets here it didnt find the system for the message
            throw new Error(`Trying to remove message: ${messageType} listener from System: ${systemName} but the system never listened to it.`);
        }
    }

    public removeSystem(systemName) {
        // remove all message listeners from that system if there are any
        // its a bit redundant but systems shouldnt be removed/added quickly anyway so doesnt
        // need to be optimized
        for(let messageType in this.engineSystemMessageGameSystemHooks) {
            try { this.removeGameSystemMessageListener(systemName, messageType) // we know this may throw an error if the system wasnt listening to anything so its okay
            } catch(err){}
        }


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

    public addSystem(system: ClientSystem) {
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

    /**
     * Queues message to be handled on the onPeerMessage
     * @param systemName
     */
    public dispatchPeerMessage(fromPeer, type, data, to, from) {
        for(let i = 0; i < to.length; i++) {
            if(!(to[i] in this._systems)) {
                console.error('trying to add peer message', type, 'to a nonexistent system name', to);
                continue;
            }
            this._systems[this.systemNames[i]].onPeerMessage(fromPeer, { type, data, from});
        }
    }

    public dispatch(systemName) {
        let i: number, system: ClientSystem, msg: Message;

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