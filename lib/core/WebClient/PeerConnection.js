"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (typeof window !== 'undefined') {
    Promise.resolve().then(() => require('webrtc-adapter'));
}
var SocketType;
(function (SocketType) {
    SocketType[SocketType["UDP"] = 0] = "UDP";
    SocketType[SocketType["TCP"] = 1] = "TCP";
})(SocketType = exports.SocketType || (exports.SocketType = {}));
const msgpack = require("./msgpack");
const signals_1 = require("@gamestdio/signals");
class PeerConnection {
    constructor(connection, clientPlayerIndex, peerPlayerIndex, configOptions) {
        this.config = {
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
        //  public onPeerMessage: Signal = new Signal();
        this.onConnected = new signals_1.Signal();
        this.onDisconnected = new signals_1.Signal();
        this.connected = false;
        this.connectOptions = null;
        this.peerPlayerIndex = peerPlayerIndex;
        this.clientPlayerIndex = clientPlayerIndex;
        // create unique channel id for players by ordering by index then joining
        this.channelId = [peerPlayerIndex, clientPlayerIndex].sort().join('-');
        console.warn('the channel id was', this.channelId);
        this.connection = connection;
        if (configOptions) {
            if (configOptions.iceServerURLs) {
                this.config.rtcPeerConfig.iceServers = configOptions.iceServerURLs.map(url => {
                    return { url };
                });
            }
            if (configOptions.socketType === SocketType.TCP) {
                this.config.dataChannelOptions = {
                    ordered: true
                };
            }
        }
    }
    onDataChannelOpen() {
        if (!this.connected) {
            console.warn('onDataChannelOpen');
            this.connected = true;
            this.onConnected.dispatch();
        }
    }
    setupDataChannel() {
        console.warn('setupDataChannel');
        this.dataChannel.binaryType = 'arraybuffer';
        this.dataChannel.onopen = this.onDataChannelOpen.bind(this);
        this.dataChannel.onclose = this.onConnectionClose.bind(this);
        this.dataChannel.onmessage = this._onPeerMessage.bind(this);
    }
    handleSDPSignal(sdp) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
            if (this.peerConnection.remoteDescription.type === 'offer') {
                console.warn('handleSDPSignal creating answer in handleSDPSignal');
                this.peerConnection.createAnswer().then(desc => {
                    this.handleLocalDescription(desc);
                });
            }
        });
    }
    ;
    handleIceCandidateSignal(candidate) {
        console.warn('handleInceCandidateSignal');
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
    handleLocalDescription(desc) {
        this.peerConnection.setLocalDescription(desc).then(() => {
            console.warn('handleLocalDescription sending local description');
            this.connection.send([111 /* SIGNAL_REQUEST */, this.peerPlayerIndex, { sdp: this.peerConnection.localDescription }]);
        });
    }
    handleInitialLocalDescription(desc, systemName, requestOptions) {
        this.peerConnection.setLocalDescription(desc).then(() => {
            //peerIndex, signalData, systemName, incomingRequestOptions?
            console.warn('handleInitialLocalDescription sending initial local description which was', this.peerConnection.localDescription, 'the request options was', requestOptions);
            this.connection.send([114 /* PEER_CONNECTION_REQUEST */, this.peerPlayerIndex, { sdp: this.peerConnection.localDescription }, systemName, requestOptions]);
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
        console.warn('onIceCandidate');
        this.connection.send([111 /* SIGNAL_REQUEST */, this.peerPlayerIndex, { candidate }]);
        return true;
    }
    // reference this https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
    requestConnection(systemName, requestOptions) {
        console.warn('requestConnection requesting connection from system:', systemName);
        this.peerConnection = new RTCPeerConnection(this.config.rtcPeerConfig);
        this.peerConnection.addEventListener('icecandidate', this.onIceCandidate.bind(this));
        this.peerConnection.onnegotiationneeded = () => {
            console.warn('onnegotationneeded');
            this.peerConnection.createOffer().then((offer) => {
                this.handleInitialLocalDescription(offer, systemName, requestOptions);
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
    acceptConnection(responseData) {
        console.warn('acceptConnection requesting connection from system:');
        this.peerConnection = new RTCPeerConnection(this.config.rtcPeerConfig);
        this.peerConnection.addEventListener('icecandidate', this.onIceCandidate.bind(this));
        this.peerConnection.ondatachannel = event => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };
    }
    onConnectionClose() {
        if (this.connected) {
            this.connected = false;
            this.peerConnection.close();
            this.onDisconnected.dispatch();
        }
    }
    send(type, data, to, from) {
        this.dataChannel.send(msgpack.encode([type, data, to, from]));
    }
    onPeerMessage(handler) {
        this._onPeerMessageHandler = handler;
    }
    _onPeerMessageHandler(message) { }
    ;
    _onPeerMessage(event) {
        const decoded = msgpack.decode(event.data);
        console.error('got the peer message through web rtc!!!!!!!', decoded);
        this._onPeerMessageHandler(decoded);
    }
    destroy() {
    }
}
exports.PeerConnection = PeerConnection;
