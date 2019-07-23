if(typeof window !== 'undefined') {
    import('webrtc-adapter');
}

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
import {Signal} from "@gamestdio/signals";

export class PeerConnection {
    readonly peerPlayerIndex: number;
    readonly clientPlayerIndex: number;
    readonly channelId: string;

    private connection: Connection;

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

    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel;

  //  public onPeerMessage: Signal = new Signal();
    public onConnected: Signal = new Signal();
    public onDisconnected: Signal = new Signal();
    public onMessage: Signal = new Signal();

    public connected: boolean = false;

    private connectOptions: any = null;

    constructor(connection: Connection, clientPlayerIndex, peerPlayerIndex: number, configOptions?: PeerConnectionConfig) {
        this.peerPlayerIndex = peerPlayerIndex;
        this.clientPlayerIndex = clientPlayerIndex;

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

    private onDataChannelOpen() {
        if(!this.connected) {
            console.warn('onDataChannelOpen');
            this.connected = true;
            this.onConnected.dispatch();
        }
    }

    private setupDataChannel() {
        console.warn('setupDataChannel');
        this.dataChannel.binaryType = 'arraybuffer';
        this.dataChannel.onopen = this.onDataChannelOpen.bind(this);
        this.dataChannel.onclose = this.onConnectionClose.bind(this);
        this.dataChannel.onmessage = this.onPeerMessage.bind(this);
    }

    public handleSDPSignal(sdp) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
            if (this.peerConnection.remoteDescription.type === 'offer') {
                console.warn('handleSDPSignal creating answer in handleSDPSignal')
                this.peerConnection.createAnswer().then(desc => {
                    this.handleLocalDescription(desc)
                })
            }
        });
    };

    public handleIceCandidateSignal(candidate) {
        console.warn('handleInceCandidateSignal');
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    private handleLocalDescription(desc) {
        this.peerConnection.setLocalDescription(desc).then(() => {
            console.warn('handleLocalDescription sending local description');
            this.connection.send([Protocol.SIGNAL_REQUEST, this.peerPlayerIndex, { sdp: this.peerConnection.localDescription}])
        });
      }

    private handleInitialLocalDescription(desc, systemName, requestOptions?) {
        this.peerConnection.setLocalDescription(desc).then(() => {
            //peerIndex, signalData, systemName, incomingRequestOptions?
            console.warn('handleInitialLocalDescription sending initial local description which was', this.peerConnection.localDescription, 'the request options was', requestOptions);
            this.connection.send([Protocol.PEER_CONNECTION_REQUEST, this.peerPlayerIndex, { sdp: this.peerConnection.localDescription}, systemName, requestOptions]);
        });
    }

    private logError(err) {
        throw new Error(err);
    }

    private onIceCandidate(event) {
        const candidate = event.candidate;
        if (candidate === null) {
            return false;
        } // Ignore null candidates
        console.warn('onIceCandidate')
        this.connection.send([Protocol.SIGNAL_REQUEST, this.peerPlayerIndex, { candidate }]);
        return true;
    }

    // reference this https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
    public requestConnection(systemName, requestOptions?) {
        console.warn('requestConnection requesting connection from system:', systemName);
        this.peerConnection = new RTCPeerConnection(this.config.rtcPeerConfig);
        this.peerConnection.addEventListener('icecandidate', this.onIceCandidate.bind(this));

        this.peerConnection.onnegotiationneeded = () => {
            console.warn('onnegotationneeded');
           this.peerConnection.createOffer().then((offer) => {
               this.handleInitialLocalDescription(offer, systemName, requestOptions)
           }).catch(err => {
               this.logError(err);
           });
        };

        this.dataChannel = this.peerConnection.createDataChannel(this.channelId);
        this.setupDataChannel();
    }

    /**
     * used for incoming signal requests
     */
    public acceptConnection(responseData: any) {
        console.warn('acceptConnection requesting connection from system:');

        this.peerConnection = new RTCPeerConnection(this.config.rtcPeerConfig);
        this.peerConnection.addEventListener('icecandidate',  this.onIceCandidate.bind(this));

        this.peerConnection.ondatachannel = event => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        }
    }

    private onConnectionClose() {
        if(this.connected) {
            this.connected = false;
            this.peerConnection.close();
            this.onDisconnected.dispatch();
        }
    }

    public send(type: string | number, data: any, to: Array<string>, from?: string | number) {
        this.dataChannel.send(msgpack.encode([type, data, to, from]));
    }

    private onPeerMessage(event) {
        const decoded = msgpack.decode(event.data);
        this.onMessage.dispatch(decoded);
    }

    public destroy() {
    }
}