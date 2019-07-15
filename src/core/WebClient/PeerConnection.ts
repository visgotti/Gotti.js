import { Connection } from "./Connection";

import { Protocol } from './Protocol';

export enum SocketType {
    UDP,
    TCP
}
export interface PeerConnectionConfig {
    iceServerURLs?: Array<string>,
    socketType?: SocketType,
}

import * as msgpack from './msgpack';
import {messageType} from "tns-core-modules/trace";

export class PeerConnection {
    private config: any = {
        rtcPeerConfig: {
            'iceServers': [{
                'url': 'stun:stun.l.google.com:19302'
            }],
        },
        dataChannelOptions: {
            ordered: false,
            maxRetransmitTime: 1000,
        },
        socketType: SocketType.UDP,
    };

    private rtcPeerConnection;
    private dataChannel;
    private peerPlayerIndex: number = null;

    private registeredMessage: boolean = false;
    public opened: boolean = false;
    private connection: Connection;

    constructor(connection: Connection, peerPlayerIndex: number, configOptions?: PeerConnectionConfig) {
        this.peerPlayerIndex = peerPlayerIndex;

        this.connection = connection;

        if(configOptions) {
            if(configOptions.iceServerURLs) {
                this.config.rtcPeerConfig.iceServers = configOptions.iceServerURLs.map(url => {
                    return { url }
                })
            }
            if(configOptions.socketType === SocketType.TCP) {
                this.config.dataChannelOptions = {
                    ordered: true
                }
            }
        }
    }

    public sendSignal(desc) {
        this.rtcPeerConnection.setLocalDescription(desc, () => {
            if(this.peerPlayerIndex === null) {
                throw new Error('Cannot answer without the peerPlayerIndex')
            }
            this.connection.send([Protocol.SIGNAL_REQUEST, this.peerPlayerIndex, { sdp: this.rtcPeerConnection.localDescription }]);
        })
    }

    public handleSDPSignal(sdp) {
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp), () => {
            // if we received an offer, we need to answers
            if (this.rtcPeerConnection.remoteDescription.type == 'offer') {
                this.rtcPeerConnection.createAnswer(this.sendSignal.bind(this), this.logError.bind(this));
            }
        }, this.logError);
    }
    public handleIceCandidateSignal(candidate) {
        this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    private logError(err) {
        throw new Error(err);
    }

    public startSignaling() {
        this.rtcPeerConnection = new webkitRTCPeerConnection(this.config.rtcPeerConfig);
        this.dataChannel = this.rtcPeerConnection.createDataChannel(`${this.peerPlayerIndex}_data`, this.config.dataChannelOptions);
        this.rtcPeerConnection.ondatachannel = this.onDataChannel.bind(this);
        this.dataChannel.onopen = this._onDataChannelOpen.bind(this);
        this.dataChannel.onclose = this._onDataChannelClose.bind(this);

        this.rtcPeerConnection.onicecandidate = (event) => {
            if(event.candidate) {
                this.connection.send([Protocol.SIGNAL_REQUEST, this.peerPlayerIndex, { 'candidate': event.candidate }])
            }
        }
        // let the 'negotiationneeded' event trigger offer generation
        this.rtcPeerConnection.onnegotiationneeded = () => {
            this.rtcPeerConnection.createOffer(this.sendSignal.bind(this), this.logError.bind(this));
        }
    }

    private onDataChannel() {
        if (this.dataChannel.readyState === 'open') {
            this._onDataChannelOpen();
        }
    }

    // functions for registering and calling data channel open
    public onDataChannelOpen(handler) {
        this._onDataChannelOpenHandler = handler;
    }
    private _onDataChannelOpen() {
        if(!this.opened) {
            this.opened = true;
            this._onDataChannelOpenHandler();
            this.dataChannel.onmessage = this._onPeerMessage.bind(this);
        }
    }
    private _onDataChannelOpenHandler(){};
    /////////////////////////////////////////////////////////////


    // functions for registering and calling data channel close
    public onDataChannelClose(handler) {
        this._onDataChannelCloseHandler = handler;
    }
    private _onDataChannelCloseHandler(){};

    private _onDataChannelClose() {
        if(this.opened) {
            this.opened = false;
            this._onDataChannelCloseHandler()
        }
    };
    /////////////////////////////////////////////////////////////

    public send(type: string | number, data: any, to: Array<string>, from?: string | number) {
        this.dataChannel.send(msgpack.encode([type, data, to, from]));
    }

    public onPeerMessage(handler) {
        if(!this.registeredMessage) {
            this.registeredMessage = true;
            this._onPeerMessageHandler = handler;
        }
    }

    private _onPeerMessageHandler(peerId, message) {};

    private _onPeerMessage(event) {
        const decoded = msgpack.decode(event.data);
        console.log('got the peer message through web rtc!!!!!!!', decoded);
        this._onPeerMessageHandler(this.peerPlayerIndex, decoded);
    }

    public destroy() {
    }

}