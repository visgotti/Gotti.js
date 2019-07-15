"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SocketType;
(function (SocketType) {
    SocketType[SocketType["UDP"] = 0] = "UDP";
    SocketType[SocketType["TCP"] = 1] = "TCP";
})(SocketType = exports.SocketType || (exports.SocketType = {}));
const msgpack = require("./msgpack");
class PeerConnection {
    constructor(connection, peerPlayerIndex, configOptions) {
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
        this.peerPlayerIndex = null;
        this.registeredMessage = false;
        this.opened = false;
        this.peerPlayerIndex = peerPlayerIndex;
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
    sendSignal(desc) {
        this.rtcPeerConnection.setLocalDescription(desc, () => {
            if (this.peerPlayerIndex === null) {
                throw new Error('Cannot answer without the peerPlayerIndex');
            }
            this.connection.send([111 /* SIGNAL_REQUEST */, this.peerPlayerIndex, { sdp: this.rtcPeerConnection.localDescription }]);
        });
    }
    handleSDPSignal(sdp) {
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp), () => {
            // if we received an offer, we need to answers
            if (this.rtcPeerConnection.remoteDescription.type == 'offer') {
                this.rtcPeerConnection.createAnswer(this.sendSignal.bind(this), this.logError.bind(this));
            }
        }, this.logError);
    }
    handleIceCandidateSignal(candidate) {
        this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
    logError(err) {
        throw new Error(err);
    }
    startSignaling() {
        this.rtcPeerConnection = new webkitRTCPeerConnection(this.config.rtcPeerConfig);
        this.dataChannel = this.rtcPeerConnection.createDataChannel(`${this.peerPlayerIndex}_data`, this.config.dataChannelOptions);
        this.rtcPeerConnection.ondatachannel = this.onDataChannel.bind(this);
        this.dataChannel.onopen = this._onDataChannelOpen.bind(this);
        this.dataChannel.onclose = this._onDataChannelClose.bind(this);
        this.rtcPeerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.connection.send([111 /* SIGNAL_REQUEST */, this.peerPlayerIndex, { 'candidate': event.candidate }]);
            }
        };
        // let the 'negotiationneeded' event trigger offer generation
        this.rtcPeerConnection.onnegotiationneeded = () => {
            this.rtcPeerConnection.createOffer(this.sendSignal.bind(this), this.logError.bind(this));
        };
    }
    onDataChannel() {
        if (this.dataChannel.readyState === 'open') {
            this._onDataChannelOpen();
        }
    }
    // functions for registering and calling data channel open
    onDataChannelOpen(handler) {
        this._onDataChannelOpenHandler = handler;
    }
    _onDataChannelOpen() {
        if (!this.opened) {
            this.opened = true;
            this._onDataChannelOpenHandler();
            this.dataChannel.onmessage = this._onPeerMessage.bind(this);
            console.log('the datachannel.on message was', this.dataChannel.onmessage);
        }
    }
    _onDataChannelOpenHandler() { }
    ;
    /////////////////////////////////////////////////////////////
    // functions for registering and calling data channel close
    onDataChannelClose(handler) {
        this._onDataChannelCloseHandler = handler;
    }
    _onDataChannelCloseHandler() { }
    ;
    _onDataChannelClose() {
        if (this.opened) {
            this.opened = false;
            this._onDataChannelCloseHandler();
        }
    }
    ;
    /////////////////////////////////////////////////////////////
    send(type, data, to, from) {
        this.dataChannel.send("testing123");
        //        this.dataChannel.send(msgpack.encode([type, data, to, from]));
    }
    onPeerMessage(handler) {
        if (!this.registeredMessage) {
            this.registeredMessage = true;
            this._onPeerMessageHandler = handler;
        }
    }
    _onPeerMessageHandler(peerId, message) { }
    ;
    _onPeerMessage(event) {
        const decoded = msgpack.decode(event.data);
        console.log('got the peer message through web rtc!!!!!!!', decoded);
        this._onPeerMessageHandler(this.peerPlayerIndex, decoded);
    }
    destroy() {
    }
}
exports.PeerConnection = PeerConnection;
