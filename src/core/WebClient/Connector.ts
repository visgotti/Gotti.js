import Clock = require('@gamestdio/clock');
import { Signal } from '@gamestdio/signals';

import { StateContainer } from '@gamestdio/state-listener';
import * as fossilDelta from 'fossil-delta';
import * as msgpack from './msgpack';

import { Connection } from './Connection';
import { Protocol, StateProtocol } from './Protocol';

import { MessageQueue } from '../MessageQueue';

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
    private _messageQueue: MessageQueue;
    private id: string;
    private gameId: string;

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

    private areas: {[areaId: string]:  Area} = {};

    public connection: Connection;
    private _previousState: any;

    constructor() {
        this.onLeave.add(() => this.removeAllListeners());
    }

    // gets set when a process is instantiated
    set messageQueue(value: MessageQueue) {
        this._messageQueue = value;
    }

    public async connect(gottiId: string, connectorURL, options: any = {}) {
        this.gottiId = gottiId;
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

    public requestListen(areaId: string, options?) {
        if(!(areaId in this.areas)) {
            throw new Error(`trying to listen to non existent area ${areaId}`)
        }
        this.connection.send([Protocol.REQUEST_LISTEN_AREA, ])
    }

    public leave(): void {
        if (this.connection) {
            //     this.connection.send([Protocol.LEAVE_ROOM]);

        } else {
            this.onLeave.dispatch();
        }
    }

    public sendSystemMessage(message: any): void {
        this.connection.send([ Protocol.SYSTEM_MESSAGE, this.id, message.type, message.data, message.to, message.from]);
    }

    public writeArea(areaId: string, options?) {
        this.connection.send([Protocol.REQUEST_WRITE_AREA, this.id, areaId, options]);
    }

    public listenArea(areaId: string, options?) {
        this.connection.send([Protocol.REQUEST_LISTEN_AREA, this.id, areaId, options]);
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
        console.log('onjoin area options was', areaOptions);
        console.log('join options were', joinOptions);
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

    protected onMessageCallback(event) {
        console.log('the event was', event);
        const message = msgpack.decode(new Uint8Array(event.data));
        const code = message[0];

        console.log('the message was', message);

        if (code === Protocol.JOIN_CONNECTOR) {
            console.log('JOINED CONNECTOR!!!!', message);
            // [areaOptions, joinOptions]
            this.onJoin(message[1], message[2]);
        } else if (code === Protocol.JOIN_CONNECTOR_ERROR) {
            this.onError.dispatch(message[1]);
        } else if (code === Protocol.REQUEST_WRITE_AREA) {
            // newAreaId, oldAreaId?, options?
            if(message[2]) {
                this.areas[message[1]].status = AreaStatus.LISTEN;
            }
            this.areas[message[0]].status = AreaStatus.WRITE;
            this.onWrite.dispatch(message[1], message[2], message[3]);

        } else if (code === Protocol.REQUEST_LISTEN_AREA) {
            // areaId, options?
            this.areas[message[1]].status = AreaStatus.LISTEN;
            this.onListen.dispatch(message[1], message[2]);
        }
        else if (code === Protocol.REQUEST_REMOVE_LISTEN_AREA) {
            this.areas[message[1]].status = AreaStatus.NOT_IN;
            this.onRemoveListen.dispatch();
        } else if (code === Protocol.SYSTEM_MESSAGE) {
            // this.messageQueue.addRemote(message[1], message[2], message[3], message[4]);
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
        return `${URL}/?${params.join('&')}`;
    }
}