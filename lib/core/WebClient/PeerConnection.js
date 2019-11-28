"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Protocol_1 = require("./Protocol");
const msgpack = require("./msgpack");
const signals_1 = require("@gamestdio/signals");
if (typeof window !== 'undefined') {
    Promise.resolve().then(() => require('webrtc-adapter'));
}
var SocketType;
(function (SocketType) {
    SocketType[SocketType["UDP"] = 0] = "UDP";
    SocketType[SocketType["TCP"] = 1] = "TCP";
})(SocketType = exports.SocketType || (exports.SocketType = {}));
const defaultConfig = {
    iceServers: [{
            'urls': ['stun:stun.l.google.com:19302']
        }],
    socketType: SocketType.UDP,
    timeout: 3000,
    retries: 3,
    retryTimeout: 1000,
};
class PeerConnection {
    constructor(connection, clientPlayerIndex, peerPlayerIndex, configOptions) {
        this.config = defaultConfig;
        this.queuedIceCandidates = [];
        this.last5Pings = [];
        this.pingInterval = null;
        //  public onPeerMessage: Signal = new Signal();
        this.onConnected = new signals_1.Signal();
        this.onDisconnected = new signals_1.Signal();
        this.onMessage = new signals_1.Signal();
        this.onMissedPing = new signals_1.Signal();
        this.connected = false;
        this.ping = 0;
        this.remoteDescriptionSet = false;
        this.missedPings = 0;
        this.seq = 0;
        this.peerPlayerIndex = peerPlayerIndex;
        this.clientPlayerIndex = clientPlayerIndex;
        if (configOptions) {
            Object.keys(configOptions).forEach(key => {
                if (this.config.hasOwnProperty(key)) {
                    this.config[key] = configOptions[key];
                }
            });
        }
        // create unique channel id for players by ordering by index then joining
        this.channelId = [peerPlayerIndex, clientPlayerIndex].sort().join('-');
        console.warn('the channel id was', this.channelId);
        this.connection = connection;
    }
    onDataChannelOpen() {
        if (!this.connected) {
            console.warn('onDataChannelOpen');
            this.connected = true;
            if (!this.pingInterval) {
                this.startPinging();
            }
            this.onConnected.dispatch();
        }
    }
    setupDataChannel() {
        console.warn('setupDataChannel');
        this.dataChannel.binaryType = 'arraybuffer';
        this.dataChannel.onopen = this.onDataChannelOpen.bind(this);
        this.dataChannel.onclose = this.onConnectionClose.bind(this);
        this.dataChannel.onmessage = this.onPeerMessage.bind(this);
    }
    applyQueuedIceCandidates() {
        for (let i = 0; i < this.queuedIceCandidates.length; i++) {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(this.queuedIceCandidates[i]));
        }
        this.queuedIceCandidates.length = 0;
    }
    handleSDPSignal(sdp) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
            console.warn('GOT SDP SIGNAL');
            if (this.peerConnection.remoteDescription.type === 'offer') {
                console.warn('handleSDPSignal creating answer in handleSDPSignal');
                this.peerConnection.createAnswer().then(desc => {
                    this.handleLocalDescription(desc);
                });
            }
            this.remoteDescriptionSet = true;
            this.applyQueuedIceCandidates();
        });
    }
    ;
    handleIceCandidateSignal(candidate) {
        if (this.remoteDescriptionSet) {
            console.warn('applying ice candidate cuz we rdy');
            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
        else {
            console.warn('received ice candidate but adding to queue');
            this.queuedIceCandidates.push(candidate);
        }
    }
    handleLocalDescription(desc) {
        this.peerConnection.setLocalDescription(desc).then(() => {
            console.warn('handleLocalDescription sending local description');
            this.connection.send([111 /* SIGNAL_REQUEST */, this.peerPlayerIndex, { sdp: this.peerConnection.localDescription }]);
        }).catch(err => {
            console.error(err);
        });
    }
    handleInitialLocalDescription(desc, systemName, requestOptions) {
        this.peerConnection.setLocalDescription(desc).then(() => {
            //peerIndex, signalData, systemName, incomingRequestOptions?
            console.warn('handleInitialLocalDescription sending initial local description which was', this.peerConnection.localDescription, 'the request options was', requestOptions);
            this.connection.send([114 /* PEER_CONNECTION_REQUEST */, this.peerPlayerIndex, { sdp: this.peerConnection.localDescription }, systemName, requestOptions]);
        }).catch(err => {
            console.error(err);
        });
    }
    logError(err) {
        throw new Error(err);
    }
    onIceCandidate(event) {
        const candidate = event.candidate;
        if (candidate === null) {
            return false;
        } // Ignore null candidates
        this.connection.send([111 /* SIGNAL_REQUEST */, this.peerPlayerIndex, { candidate }]);
        return true;
    }
    // reference this https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
    requestConnection(systemName, requestOptions) {
        console.warn('requestConnection requesting connection from system:', systemName);
        this.initiator = true;
        const config = {
            'iceServers': this.config.iceServers,
        };
        this.peerConnection = new RTCPeerConnection(config);
        this.peerConnection.addEventListener('icecandidate', this.onIceCandidate.bind(this));
        this.peerConnection.onnegotiationneeded = () => {
            console.warn('onnegotationneeded');
            this.peerConnection.createOffer().then((offer) => {
                this.handleInitialLocalDescription(offer, systemName, requestOptions);
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
    acceptConnection(responseData) {
        console.warn('acceptConnection requesting connection from system:');
        this.initiator = false;
        this.peerConnection = new RTCPeerConnection({ iceServers: this.config['iceServers'] });
        this.peerConnection.addEventListener('icecandidate', this.onIceCandidate.bind(this));
        this.peerConnection.ondatachannel = event => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };
    }
    onConnectionClose() {
        if (this.connected) {
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
            console.error('on connection close being fired :]');
            this.connected = false;
            this.onDisconnected.dispatch();
        }
    }
    startPinging() {
        let lastSent = this.seq;
        this.sentPingAt = Date.now();
        this.send(msgpack.encode([Protocol_1.PEER_TO_PEER_PROTOCOLS.PING, this.seq]));
        this.pingInterval = setInterval(() => {
            // this.seq should increase by 1 by the time we get back here
            if (lastSent !== this.seq - 1) {
                this.missedPings++;
                this.seq = 0;
                lastSent = 0;
                this.onMissedPing.dispatch(this.missedPings);
            }
            else {
                this.missedPings = 0;
                lastSent++;
            }
            this.sentPingAt = Date.now();
            this.send(msgpack.encode([Protocol_1.PEER_TO_PEER_PROTOCOLS.PING, this.seq]));
        }, this.config.timeout);
    }
    send(message) {
        if (this.dataChannel.readyState === 'open') {
            this.dataChannel.send(message);
        }
    }
    handlePong(seq) {
        let ping = Date.now() - this.sentPingAt;
        if (seq === this.seq) { // we good they sent back our seq
            this.seq++;
            if (this.last5Pings.length > 4) {
                // micro optimization hand implemented shift
                this.last5Pings[5] = this.last5Pings[4];
                this.last5Pings[4] = this.last5Pings[3];
                this.last5Pings[3] = this.last5Pings[2];
                this.last5Pings[2] = this.last5Pings[1];
                this.last5Pings[1] = this.last5Pings[0];
                this.last5Pings[0] = ping;
                this.ping = (this.last5Pings[0] + this.last5Pings[1] + this.last5Pings[2] + this.last5Pings[3] + this.last5Pings[4]) / 5;
            }
            else {
                this.last5Pings.push(ping);
                const total = this.last5Pings.reduce((acc, c) => acc + c, 0);
                this.ping = total / this.last5Pings.length;
            }
        }
        else {
            throw new Error(`INVALID SEQUENCE ${seq} SENT BACK WHEN WE EXPECTED ${this.seq}`);
        }
    }
    onPeerMessage(event) {
        const decoded = msgpack.decode(event.data);
        if (decoded.length < 3) {
            if (decoded[0] === Protocol_1.PEER_TO_PEER_PROTOCOLS.PING) {
                this.send(msgpack.encode([Protocol_1.PEER_TO_PEER_PROTOCOLS.PONG, decoded[1]]));
            }
            else if (decoded[0] === Protocol_1.PEER_TO_PEER_PROTOCOLS.PONG) {
                this.handlePong(decoded[1]);
            }
        }
        else {
            this.onMessage.dispatch(decoded);
        }
    }
    destroy() {
        this.peerConnection.close();
    }
}
exports.PeerConnection = PeerConnection;
