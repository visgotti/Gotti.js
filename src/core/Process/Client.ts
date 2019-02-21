import { Process, PROCESS_ENV } from './Process';
import { Client as WebClient } from '../WebClient/Client';
import ClientSystem from '../System/ClientSystem';
import { setGameLoop, clearGameLoop } from '../ClientGameLoop';
import { MessageQueue } from '../MessageQueue';
interface ClientProcessOptions {
    fpsTickRate?: number,
}

export class ClientProcess extends Process<ClientProcess> {
    public client: WebClient;

    private fpsTickRate: number = 60;

    public messageQueue: MessageQueue;

    constructor(client: WebClient, globals?: any, options?: ClientProcessOptions) {
        super(PROCESS_ENV.CLIENT, globals);

        if(!(client)) {
            throw new Error('Client process needs a web client to construct correctly.')
        }

        if(options && options.fpsTickRate) {
            this.fpsTickRate = options.fpsTickRate;
        }

        client.addProcess(this);

        this.client = client;
        // add messageQueue to client which is created in the super constructor.
        this.systemInitializer = this.initializerFactory(this);
//   this.room.onMessageQueueRelay.add(this.onMessageQueueRelay.bind(this))
    }

    // runs abstract area status update functions if the system implements it
    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param isInitial - boolean indicating if this is the first area the client is joining
     * @param options - options sent back from area when accepting the write request.
     */
    public dispatchOnAreaWrite(areaId, isInitial: boolean, options?) {
        const length = this.systemNames.length;
        for(let i = 0; i < length; i++) {
            const system = this.systems[this.systemNames[i]] as ClientSystem;
            system.onAreaWrite && system.onAreaWrite(areaId, isInitial, options)
        }
    }

    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param state - state of the area you receive upon listening
     * @param options - options sent back from area when it added the client as listener
     */
    public dispatchOnAreaListen(areaId, state: any, options?: any) {
        const length = this.systemNames.length;
        for(let i = 0; i < length; i++) {
            const system = this.systems[this.systemNames[i]] as ClientSystem;
            system.onAreaListen && system.onAreaListen(areaId, options)
        }
    }

    /**
     *
     * @param areaId - id of area that the client is now writing to.
     * @param options - options sent back from area when the client was removed.
     */
    public dispatchOnRemoveAreaListen(areaId, options?) {
        const length = this.systemNames.length;
        for(let i = 0; i < length; i++) {
            const system = this.systems[this.systemNames[i]] as ClientSystem;
            system.onRemoveAreaListen && system.onRemoveAreaListen(areaId, options)
        }
    }

    public startLoop(fps = this.fpsTickRate) {
        setGameLoop(this.tick.bind(this), 1000 / fps);
    }

    public stopLoop() {
        clearGameLoop();
    }

    public startSystem(systemName) {
        this._startSystem(systemName);
    }

    public startAllSystems() {
        this._startAllSystems();
    }

    public stopSystem(systemName) {
        this._stopSystem(systemName);
    }

    public stopAllSystems() {
        this._stopAllSystems();
    }
}