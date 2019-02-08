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

    private areas: {[areaId: string]:  Area};

    public connection: Connection;
    private _previousState: any;

    constructor() {
        this.onLeave.add(() => this.removeAllListeners());
    }

    set messageQueue(value: MessageQueue) {
        this._messageQueue = value;
    }

    public connect(gottiId: string, URL, options: any = {}) {
        if(!(this._messageQueue)) {
            throw new Error('Message queue was not initialized for web client\'s Connector, can not connect Connector.')
        }

        this.gottiId = gottiId;
        let url = this.buildEndPoint(URL, options);

        this.connection = new Connection(url);
        this.connection.onmessage = this.onMessageCallback.bind(this);
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

    protected onJoin(sessionId, gameId, areaOptions) {
        this.sessionId = sessionId;
        this.onJoinConnector.dispatch(gameId, areaOptions);

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
        const message = msgpack.decode( new Uint8Array(event.data) );
        const code = message[0];

        if (code === Protocol.JOIN_CONNECTOR) {
            // [sessionId, client.id, gameId, areaOptions]
            this.onJoin(message[1], message[2], message[3]);
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