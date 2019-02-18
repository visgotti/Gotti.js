import Clock = require('@gamestdio/clock');
import { Signal } from '@gamestdio/signals';

import { StateContainer } from '@gamestdio/state-listener';
import * as fossilDelta from 'fossil-delta';
import * as msgpack from './msgpack';

import { Connection } from './Connection';
import { Protocol, StateProtocol } from './Protocol';

import { MessageQueue } from '../MessageQueue';

import { ClientProcess } from '../Process/Client';

export enum AreaStatus {
    NOT_IN = 0,
    LISTEN = 1,
    WRITE = 2
}

export interface Area {
    _previousState: any,
    status: AreaStatus,
    state: StateContainer,
    options: any,
}


export class Connector {
    private messageQueue: any; //todo type
    private id: string;
    private gameId: string;

    // used to indicate current area id the client is writing to.
    private writeAreaId: string | number = null;

    public gottiId: string;
    public sessionId: string;

    public options: any;

    public clock: Clock = new Clock(); // experimental
    public remoteClock: Clock = new Clock(); // experimental

    // Public signals
    public onJoinConnector: Signal = new Signal();

    public onWrite: Signal = new Signal();
    public onListen: Signal = new Signal();
    public onRemoveListen: Signal = new Signal();
    public onStateChange: Signal = new Signal();
    public onMessage: Signal = new Signal();
    public onError: Signal = new Signal();
    public onLeave: Signal = new Signal();
    public onOpen: Signal = new Signal();

    private process: ClientProcess;

    private areas: {[areaId: string]:  Area} = {};

    public connection: Connection;
    private _previousState: any;

    constructor() {}

    public async connect(gottiId: string, connectorURL, process: ClientProcess, options: any = {}) {
        this.gottiId = gottiId;

        this.process = process;
        this.messageQueue = process.messageQueue;

        let url = this.buildEndPoint(connectorURL, options);
        this.connection = new Connection(url);
        this.connection.onopen = () => {};
        this.connection.onmessage = this.onMessageCallback.bind(this);
        return new Promise((resolve, reject) => {
            this.onJoinConnector.add((areaData, joinData) => {
                return resolve({ areaData, joinData });
            })
        })
    }

    public joinInitialArea(options?) {
        if(!this.connection ) {
            throw new Error('No connection, can not join an initial area');
        }

        if(this.writeAreaId !== null) {
            throw new Error('Player is already writing to an area.')
        }

        this.connection.send([Protocol.GET_INITIAL_CLIENT_AREA_WRITE, options]);
    }

    public leave(): void {
        if (this.connection) {
            //     this.connection.send([Protocol.LEAVE_ROOM]);

        } else {
            this.onLeave.dispatch();
        }
    }

    public sendSystemMessage(message: any): void {
        this.connection.send([ Protocol.SYSTEM_MESSAGE, message.type, message.data, message.to, message.from]);
    }

    public sendImmediateSystemMessage(message: any): void {
        this.connection.send([ Protocol.IMMEDIATE_SYSTEM_MESSAGE, message.type, message.data, message.to, message.from]);
    }

    public get hasJoined() {
        return this.sessionId !== undefined;
    }

    public removeAllListeners() {
        //  super.removeAllListeners();
        this.onJoinConnector.removeAll();
        this.onStateChange.removeAll();
        this.onMessage.removeAll();
        this.onError.removeAll();
        this.onLeave.removeAll();
    }

    protected onJoin(areaOptions, joinOptions) {
        this.onJoinConnector.dispatch(areaOptions, joinOptions);
        Object.keys(areaOptions).forEach(areaId => {
            this.areas[areaId] = {
                _previousState: {},
                status: AreaStatus.NOT_IN,
                state: new StateContainer({}),
                options: areaOptions[areaId],
            };
        })
    }

    protected onMessageCallback(event) { // TODO: REFACTOR PROTOCOLS TO USE BITWISE OPS PLS
        const message = msgpack.decode(new Uint8Array(event.data));
        const code = message[0];
        if (code === Protocol.JOIN_CONNECTOR) {
            // [areaOptions, joinOptions]
            this.onJoin(message[1], message[2]);
        } else if (code === Protocol.JOIN_CONNECTOR_ERROR) {
            this.onError.dispatch(message[1]);
        } else if (code === Protocol.SET_CLIENT_AREA_WRITE) {
            // newAreaId, oldAreaId?, options?
            if(message[2]) {
                this.areas[message[1]].status = AreaStatus.LISTEN;
            }
            this.areas[message[1]].status = AreaStatus.WRITE;

            this.process.dispatchOnAreaWrite(message[1], this.writeAreaId === null, message[2]);
            this.writeAreaId = message[1];
        } else if (code === Protocol.ADD_CLIENT_AREA_LISTEN) {
            // areaId, options?
            this.areas[message[1]].status = AreaStatus.LISTEN;
            const { responseOptions, encodedState } = message[2];
            this.process.dispatchOnAreaListen(message[1], encodedState, responseOptions);
        }
        else if (code === Protocol.REMOVE_CLIENT_AREA_LISTEN) {
            this.areas[message[1]].status = AreaStatus.NOT_IN;
            this.process.dispatchOnRemoveAreaListen(message[1], message[2]);
        } else if (code === Protocol.SYSTEM_MESSAGE) {
            this.messageQueue.addRemote(message[1], message[2], message[3], message[4]);
        } else if (code === Protocol.IMMEDIATE_SYSTEM_MESSAGE) {
            this.messageQueue.instantDispatch({ type: message[1], data: message[2], to: message[3], from: message[4] }, true);
        }
        else if (code === Protocol.AREA_STATE_UPDATE) {
            const updateType = message[1];
            const areaId = message[2];
            if(updateType === StateProtocol.SET) {
                this.setState(message[1], message[2]);
            } else if (updateType === StateProtocol.PATCH) {
                this.patch(message[1], message[2]);
            }
        }// else if (code === Protocol.LEAVE_ROOM) {
         //   this.leave();
        //  }
    }

    protected setState( areaId: string, encodedState: Buffer ): void {
        const state = msgpack.decode(encodedState);

        const area = this.areas[areaId];

        area.state.set(state);

        this._previousState = new Uint8Array( encodedState );

        this.onStateChange.dispatch(state);
    }

    protected patch(areaId, binaryPatch) {
        // apply patch
        const area = this.areas[areaId];
        area._previousState = Buffer.from(fossilDelta.apply(area._previousState, binaryPatch));

        // trigger state callbacks
        area.state.set( msgpack.decode(area._previousState) );

        this.onStateChange.dispatch(area.state);
    }

    private buildEndPoint(URL, options: any ={}) {
        console.log('the url to build from was', URL);
        console.log('the options were', options);
        const params = [ `gottiId=${this.gottiId}`];
        for (const name in options) {
            if (!options.hasOwnProperty(name)) {
                continue;
            }
            params.push(`${name}=${options[name]}`);
        }
        return `ws://${URL}/?${params.join('&')}`;
    }
}