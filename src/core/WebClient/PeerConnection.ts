import { Connection } from "./Connection";
import { ClientProcess } from "../Process/Client";
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
    private clientPlayerIndex: number = null;
    readonly channelId: string;

    private registeredMessage: boolean = false;
    public opened: boolean = false;
    private connection: Connection;

    private sentIce = false;

    private process: ClientProcess;

    constructor(connection: Connection, process: ClientProcess, clientPlayerIndex, peerPlayerIndex: number, configOptions?: PeerConnectionConfig) {
        this.peerPlayerIndex = peerPlayerIndex;
        this.clientPlayerIndex = clientPlayerIndex;
        this.process = process;
        // create unique channel id for players by ordering by index then joining
        this.channelId = [peerPlayerIndex, clientPlayerIndex].sort().join('-');

        console.warn('the channel id was', this.channelId);
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
        this.dataChannel = this.rtcPeerConnection.createDataChannel(this.channelId, this.config.dataChannelOptions);
        this.rtcPeerConnection.ondatachannel = this.onDataChannel.bind(this);
        this.dataChannel.onopen = this._onDataChannelOpen.bind(this);
        this.dataChannel.onmessage = this._onPeerMessage.bind(this);
        this.dataChannel.onclose = this._onDataChannelClose.bind(this);

        this.rtcPeerConnection.onicecandidate = (event) => {
            if(event.candidate && !this.sentIce) {
                console.warn('onicecandidate:', event.candidate,'sending to,', this.peerPlayerIndex);
                this.sentIce = true;
                this.connection.send([Protocol.SIGNAL_REQUEST, this.peerPlayerIndex, { 'candidate': event.candidate }])
            }
        }
        // let the 'negotiationneeded' event trigger offer generation
        this.rtcPeerConnection.onnegotiationneeded = () => {
            this.rtcPeerConnection.createOffer(this.sendSignal.bind(this), this.logError.bind(this));
        }
    }

    private onDataChannel(event) {
        this.dataChannel = event.channel;
        if (this.dataChannel.readyState === 'open') {
            this._onDataChannelOpen();
        } else if (this.dataChannel.readyState === 'close') {
            this._onDataChannelClose();
        }

        this.dataChannel.onopen = this._onDataChannelOpen.bind(this);
        this.dataChannel.onmessage = this._onPeerMessage.bind(this);
        this.dataChannel.onclose = this._onDataChannelClose.bind(this);
    }

    // functions for registering and calling data channel open
    public onDataChannelOpen(handler) {
        this._onDataChannelOpenHandler = handler;
    }
    private _onDataChannelOpen() {
        this.opened = true;
        this._onDataChannelOpenHandler();
    }
    private _onDataChannelOpenHandler(){};
    /////////////////////////////////////////////////////////////


    // functions for registering and calling data channel close
    public onDataChannelClose(handler) {
        this._onDataChannelCloseHandler = handler;
    }
    private _onDataChannelCloseHandler(){};

    private _onDataChannelClose() {
        console.log('CLOSE');
        this.opened = false;
        this._onDataChannelCloseHandler()
    };
    /////////////////////////////////////////////////////////////

    public send(type: string | number, data: any, to: Array<string>, from?: string | number) {
        console.warn('attempting to send peer message', this.dataChannel);
        this.dataChannel.send(msgpack.encode([type, data, to, from]));
    }

    public onPeerMessage(handler) {
        this._onPeerMessageHandler = handler;
    }

    private _onPeerMessageHandler(message) {};

    private _onPeerMessage(event) {
        const decoded = msgpack.decode(event.data);
        console.error('got the peer message through web rtc!!!!!!!', decoded);
        this._onPeerMessageHandler(decoded);
    }


    public destroy() {
    }

}