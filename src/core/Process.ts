export enum PROCESS_ENV {
    CLIENT = 0,
    SERVER = 1,
}

import { MessageQueue, Message } from './MessageQueue'
import System from './System/System';
import { client, server } from './System/SystemInitializer';

type SystemLookup = { [systemName: string]: System<any> }

export abstract class Process<T> {
    private messageQueue: MessageQueue;

    // SHARED FRAMEWORKS
    private entityManager: any;
    private gameState: any;
    private interfaceManager?: any;
    private initializerFactory: (Process) => (System) => void;
    private systemInitializer: (System) => void;

    // SERVER FRAMEWORKS
    private serverRoom?: any;

    // CLIENT FRAMEWORKS
    private clientRoom?: any;

    private systemDecorator: (System) => void;

    public systems: SystemLookup;
    public systemNames: Array<string>;

    private systemInitializedOrder: Map<string, number>;

    public startedSystemsLookup: Set<string>;
    public startedSystems: Array<System>;

    public stoppedSystems: Set<string>;

    constructor(processEnv: PROCESS_ENV) {
        this.messageQueue = new MessageQueue();
        this.gameState = {};
        this.interfaceManager = {};
        this.initializerFactory = processEnv === PROCESS_ENV.SERVER ? server : client;
        this.systemInitializer = this.initializerFactory(this);
    }

    public abstract initializeSystems();

    protected onMessageQueueRelay(message) {
        this.messageQueue.add(message);
    }

    protected initializeSystem(system: System<T>) {
        if (this.systems[system.name]) {
            throw `Duplicate systen name ${system.name}`;
            return;
        }

        this.systemInitializer(system);
        this.systems[system.name] = system;
        this.systemNames.push(system.name);

        // keep track of the order we initialized the systems in so when systems are stopped
        // and started we can keep track of only the needed names in order
        this.systemInitializedOrder.set(system.name, this.systemInitializedOrder.size);


        this.stoppedSystems.add(system.name);
    }

    protected stopAllSystems() {
        for(let i = 0; i < this.systemNames.length; i++) {
            this.stopSystem(this.systemNames[i]);
        }
    }

    protected stopSystem(systemName) {
        if (this.startedSystemsLookup.has(systemName)) {
            this.systems[systemName].onStop();

            this.startedSystemsLookup.delete(systemName);

            for(let i = 0; i < this.startedSystems.length; i++) {
                if(this.startedSystems[i].name === systemName) {
                    this.startedSystems.splice(i, 1);
                    break;
                }
            }

            this.stoppedSystems.add(systemName);
        }
    }

    protected startAllSystems() {
        for(let i = 0; i < this.systemNames.length; i++) {
            this.startSystem(this.systemNames[i]);
        }
    }

    protected startSystem(systemName) {
        if (this.stoppedSystems.has(systemName)) {
            this.startedSystemsLookup.add(systemName);
            const toStartInitializedIndex = this.systemInitializedOrder.get(systemName);

            const lastStartedSystemName = this.startedSystems[this.startedSystems.length - 1].name;
            const lastStartedSystemInitializedIndex = this.systemInitializedOrder.get(lastStartedSystemName);

            // can just add it to end
            if(toStartInitializedIndex > lastStartedSystemInitializedIndex) {
                this.startedSystems.push(systemName);
            } else {
                // find where it should be.
                for(let i = 0; i < this.startedSystems.length; i++) {
                    const startedInitializedIndex = this.systemInitializedOrder.get(this.startedSystems[i].name);
                    // find where in order it should be.
                    if(toStartInitializedIndex > startedInitializedIndex) {
                        // add system to correct order
                        this.startedSystems.splice(i + 1, 0, this.systems[systemName]);
                        break;
                    }
                }
            }
            this.systems[systemName].onStart();
        }
    }

    protected tick(delta) {
        for (let i = 0; i < this.startedSystems.length; i++) {
            this.messageQueue.dispatch(this.startedSystems[i].name);
            this.startedSystems[i].update(delta);
        }
    }

    private sortStartedSystemsArray() {
    }
}
