import System from './System/System';

export interface Message {
    type: string,
    data: any,
    to: Array<string>
    from: string,
}

type SystemMessageLookup = { [systemName: string]: Array<Message> }
type SystemLookup = { [systemName: string]: System<any> }

export class MessageQueue {

    private systems: SystemLookup;
    private messages = SystemMessageLookup;
    private systemNames: Array<string>;

    constructor() {
        this.systems = {} as SystemLookup;
        this.messages = {} as SystemMessageLookup;
        this.systemNames = [];
    }

    public addSystem(system: System) {
        this.systems[system.name] = system;
        this.messages[system.name] = [];
        this.systemNames.push(system.name);
    }

    public add(message: Message) {
        for(let i = 0; i < message.to.length; i++) {
            this.messages[message.to[i]].push(message);
        }
    };

    public dispatch(systemName) {
        let i: number, system: System, msg: Message;

        for(i = 0; this.messages[systemName].length; i++){
            msg = this.messages[systemName][i];
            if(msg) {
                system = this.systems[systemName];
                if (system) {
                    system.onMessage(msg)
                }
            }
            this.messages[systemName].splice(i, 1);
            i--;
        }
    }

    private startLeakChecker() {
        // every 10 seconds  check if any of the message sizes are too large
        setInterval(() => {
            Object.keys(this.messages).forEach(systemName => {
                if(this.messages[systemName].length > 50) {
                    let messageTypeCounts = {};
                    for(let i = 0; i < this.messages[systemName].length; i++) {
                        if(!(this.messages[systemName][i].type in messageTypeCounts)) {
                            messageTypeCounts[this.messages[systemName][i].type] = 0;
                        }
                        messageTypeCounts[this.messages[systemName][i].type]++;
                    }
                    throw new Error(`Possible leak for system, ${systemName} message counts were ${messageTypeCounts}`);
                }
            })
        }, 10000);
    }
}