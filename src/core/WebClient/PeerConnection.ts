import {Connection} from "./Connection";

import { PEER_TO_PEER_PROTOCOLS, Protocol} from './Protocol';
import * as msgpack from './msgpack';
import {Signal} from "@gamestdio/signals";
import Timer = NodeJS.Timer;

if(typeof window !== 'undefined') {
    import('webrtc-adapter');
}

export enum SocketType {
    UDP,
    TCP
}

export interface PeerConnectionConfig {
    iceServers?: Array<RTCIceServer>,
    socketType?: SocketType,
    timeout?: number,
    retries?: number,
    retryTimeout?: number,
}

const defaultConfig = {
    iceServers: [{
        'urls': ['stun:stun.l.google.com:19302']
    }],
    socketType: SocketType.UDP,
    timeout: 3000,
    retries: 3,
    retryTimeout: 1000,
};


export class PeerConnection {
    readonly peerPlayerIndex: number;
    readonly clientPlayerIndex: number;
    readonly channelId: string;

    private connection: Connection;

    private config: PeerConnectionConfig = defaultConfig;
    private queuedIceCandidates: Array<any> = [];
    private last5Pings: Array<number> = [];
    private initiator: boolean;

    private pingInterval: Timer = null;
    private sentPingAt: number;
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel;

  //  public onPeerMessage: Signal = new Signal();
    // on ack is signaled basically saying the other client has received and sent back an acknowledgement that we want to p2p
    public onAck: Signal = new Signal();
    public onConnected: Signal = new Signal();
    public onDisconnected: Signal = new Signal();
    public onMessage: Signal = new Signal();
    public onMissedPing: Signal = new Signal();
    public connected: boolean = false;

    private ping: number = 0;

    private remoteDescriptionSet: boolean = false;

    private missedPings: number = 0;

    private seq: number = 0;

    public gotAck: boolean=false;

    constructor(connection: Connection, clientPlayerIndex: number, peerPlayerIndex: number, configOptions?: PeerConnectionConfig) {
        this.peerPlayerIndex = peerPlayerIndex;
        this.clientPlayerIndex = clientPlayerIndex;

        if(configOptions) {
            Object.keys(configOptions).forEach(key => {
                if(this.config.hasOwnProperty(key)) {
                    this.config[key] = configOptions[key];
                }
            });
        }
        // create unique channel id for players by ordering by index then joining
        this.channelId = [peerPlayerIndex, clientPlayerIndex].sort().join('-');

        console.warn('the channel id was', this.channelId);
        this.connection = connection;
    }

    private onDataChannelOpen() {
        if(!this.connected) {
            console.warn('onDataChannelOpen');
            this.connected = true;
            if(!this.pingInterval) {
                this.startPinging();
            }
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

    private applyQueuedIceCandidates() {
        for(let i = 0; i < this.queuedIceCandidates.length; i++) {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(this.queuedIceCandidates[i]));
        }
        this.queuedIceCandidates.length = 0;
    }

    public checkAck() {
        if(!this.gotAck) {
            this.onAck.dispatch(true);
            this.gotAck = true;
        }
    }

    public handleSDPSignal(sdp) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
            console.warn('GOT SDP SIGNAL')
            if (this.peerConnection.remoteDescription.type === 'offer') {
                console.warn('handleSDPSignal creating answer in handleSDPSignal');
                this.peerConnection.createAnswer().then(desc => {
                    this.handleLocalDescription(desc)
                })
            }
            this.remoteDescriptionSet = true;
            this.applyQueuedIceCandidates();
        });
    };

    public handleIceCandidateSignal(candidate) {
        if(this.remoteDescriptionSet) {
            console.warn('applying ice candidate cuz we rdy');
            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
            console.warn('received ice candidate but adding to queue');
            this.queuedIceCandidates.push(candidate);
        }
    }

    private handleLocalDescription(desc) {
        this.peerConnection.setLocalDescription(desc).then(() => {
            console.warn('handleLocalDescription sending local description');
            this.connection.send([Protocol.SIGNAL_REQUEST, this.peerPlayerIndex, { sdp: this.peerConnection.localDescription}])
        }).catch(err => {
            console.error(err);
        });
      }

    private handleInitialLocalDescription(desc, systemName, requestOptions?) {
        this.peerConnection.setLocalDescription(desc).then(() => {
            //peerIndex, signalData, systemName, incomingRequestOptions?
            console.warn('handleInitialLocalDescription sending initial local description which was', this.peerConnection.localDescription, 'the request options was', requestOptions);
            this.connection.send([Protocol.PEER_CONNECTION_REQUEST, this.peerPlayerIndex, { sdp: this.peerConnection.localDescription}, systemName, requestOptions]);
        }).catch(err => {
            console.error(err);
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
        this.connection.send([Protocol.SIGNAL_REQUEST, this.peerPlayerIndex, { candidate }]);
        return true;
    }

    // reference this https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
    public requestConnection(systemName, requestOptions?) {
        console.warn('requestConnection requesting connection from system:', systemName);
        this.initiator = true;
        const config = {
            'iceServers': this.config.iceServers,
        } as RTCConfiguration;

        this.peerConnection = new RTCPeerConnection(config);
        this.peerConnection.addEventListener('icecandidate', this.onIceCandidate.bind(this));

        this.peerConnection.onnegotiationneeded = () => {
            console.warn('onnegotationneeded');
           this.peerConnection.createOffer().then((offer) => {
               this.handleInitialLocalDescription(offer, systemName, requestOptions)
           }).catch(err => {
               this.logError(err);
           });
        };

        this.dataChannel = this.peerConnection.createDataChannel(this.channelId, {
            ordered: this.config.socketType === SocketType.TCP
        });

        this.setupDataChannel();
    }

    /**
     * used for incoming signal requests
     */
    public acceptConnection(responseData: any) {
        console.warn('acceptConnection requesting connection from system:');
        this.initiator = false;

        this.peerConnection = new RTCPeerConnection({ iceServers: this.config['iceServers'] });
        this.peerConnection.addEventListener('icecandidate',  this.onIceCandidate.bind(this));

        this.peerConnection.ondatachannel = event => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        }
    }

    private onConnectionClose() {
        if(this.connected) {
            if(this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
            console.error('on connection close being fired :]')
            this.connected = false;
            this.onDisconnected.dispatch();
        }
    }

    private startPinging() {
        let lastSent = this.seq;
        this.sentPingAt = Date.now();
        this.send(msgpack.encode([PEER_TO_PEER_PROTOCOLS.PING, this.seq]));
        this.pingInterval = setInterval(() => {
            // this.seq should increase by 1 by the time we get back here
            if(lastSent !== this.seq - 1) {
                this.missedPings++;
                this.seq = 0;
                lastSent = 0;
                this.onMissedPing.dispatch(this.missedPings);
            } else {
                this.missedPings = 0;
                lastSent++;
            }
            this.sentPingAt = Date.now();
            this.send(msgpack.encode([PEER_TO_PEER_PROTOCOLS.PING, this.seq]));
        }, this.config.timeout);
    }

    public send(message) {
        if(this.dataChannel.readyState === 'open') {
            this.dataChannel.send(message);
        }
    }

    private handlePong(seq) {
        let ping = Date.now() - this.sentPingAt;
        if(seq === this.seq) { // we good they sent back our seq
            this.seq++;
            if (this.last5Pings.length > 4) {
                // micro optimization hand implemented shift
                this.last5Pings[5] = this.last5Pings[4];
                this.last5Pings[4] = this.last5Pings[3];
                this.last5Pings[3] = this.last5Pings[2];
                this.last5Pings[2] = this.last5Pings[1];
                this.last5Pings[1] = this.last5Pings[0];
                this.last5Pings[0]  = ping;
                this.ping = (this.last5Pings[0] + this.last5Pings[1] + this.last5Pings[2] + this.last5Pings[3] + this.last5Pings[4]) / 5;
            } else {
                this.last5Pings.push(ping);
                const total = this.last5Pings.reduce((acc, c) => acc + c, 0);
                this.ping = total / this.last5Pings.length;
            }
        } else {
            throw new Error(`INVALID SEQUENCE ${seq} SENT BACK WHEN WE EXPECTED ${this.seq}`);
        }
    }

    private onPeerMessage(event) {
        const decoded = msgpack.decode(event.data);
        if(decoded.length < 3) {
            if(decoded[0] === PEER_TO_PEER_PROTOCOLS.PING) {
                this.send(msgpack.encode([PEER_TO_PEER_PROTOCOLS.PONG, decoded[1]]));
            } else if (decoded[0] === PEER_TO_PEER_PROTOCOLS.PONG) {
                this.handlePong(decoded[1]);
            }
        } else {
            this.onMessage.dispatch(decoded);
        }
    }

    public destroy() {
        this.peerConnection.close();
    }
}