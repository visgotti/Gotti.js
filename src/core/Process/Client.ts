import { Process, PROCESS_ENV } from './Process';
import { Client as WebClient } from '../WebClient/Client';
import ClientSystem from '../System/ClientSystem';
import { setGameLoop, clearGameLoop } from '../ClientGameLoop';
import { ClientMessageQueue } from '../ClientMessageQueue';
interface ClientProcessOptions {
    fpsTickRate?: number,
}

export class ClientProcess extends Process<ClientProcess> {
    public client: WebClient;

    private fpsTickRate: number = 60;

    public messageQueue: ClientMessageQueue;

    public isNetworked: boolean = false;

    public peers: Array<number> = [];

    constructor(client: WebClient, isNetworked: boolean, globals?: any, options?: ClientProcessOptions) {
        super(PROCESS_ENV.CLIENT, globals);

        this.isNetworked = isNetworked;

        if(!(client)) {
            throw new Error('Client process needs a web client to construct correctly.')
        }

        if(options && options.fpsTickRate) {
            this.fpsTickRate = options.fpsTickRate;
        }

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

    /**
     * when we receive a peer connection request if the system doesnt have a onPeerConnectionRequested handler
     * we automatically return false and fail the peer connection
     * @param peerId
     * @param systemName
     * @param options
     */
    public onPeerConnectionRequested(peerId, systemName: number | string, options?: any) {
        const system = this.systems[systemName] as ClientSystem;
        if(system && system.onPeerConnectionRequested) {
            return system.onPeerConnectionRequested(peerId, options)
        }
        return false;
    }

    /**
     * If the peer returns their onPeerConnectionRequested with anything truthy it will
     * be passed in to the systems onPeerConnectionAccepted as the options
     * @param peerId
     * @param systemName
     * @param options
     */
    public onPeerConnectionAccepted(peerId, systemName: number | string, options?: any) {
        const system = this.systems[systemName] as ClientSystem;
        if(system && system.onPeerConnectionAccepted) {
            system.onPeerConnectionAccepted(peerId, options)
        }
    }

    /**
     * If the peer returns their onPeerConnectionRequested with anything falsey or
     * it was just not possible to begin with, this will get triggered.
     * @param peerId
     * @param systemName
     * @param options
     */
    public onPeerConnectionRejected(peerId, systemName: number | string) {
        const system = this.systems[systemName] as ClientSystem;
        if(system && system.onPeerConnectionRejected) {
            system.onPeerConnectionRejected(peerId)
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