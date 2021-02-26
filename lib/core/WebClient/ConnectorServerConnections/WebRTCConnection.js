"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const msgpack = require("../msgpack");
class WebRTCConnection {
    constructor(peerConnection) {
        this.reliableSeq = 0;
        this.nextReliableSeqToReceive = 0;
        this.bufferedReliable = [];
        this.awaitingAcks = {};
        this._onMessageCallback = () => { };
        this.reliableSendCount = 3;
        this.reliableResendTimeout = 50;
        this.sentReliableAckSequences = [];
        this.sentOrderedAckSequences = [];
        this.nextSequenceNumber = 0;
        this.nextOrderedSequenceNumber = 0;
        this.lastAckSequenceNumber = 0;
        this.lastAckOrderedSequenceNumber = 0;
        this.orderedReliableBuffer = {};
        this.reliableBuffer = {};
        this.receivedOutOfOrderSeq = [];
        this.alreadyProcessedReliableSeqs = {};
        this.lowestUnorderedSeqProcessed = 0;
        this.hasAcks = false;
        this.pc = peerConnection;
        this.dataChannel = this.pc.dataChannel;
        if (this.dataChannel) {
            this.dataChannel.onmessage = this._messageHandler.bind(this);
            this.dataChannel.onclose = () => {
                if (this.ackTimeout) {
                    clearTimeout(this.ackTimeout);
                }
                this.hasAcks = false;
                this.sentOrderedAckSequences.length = 0;
                this.sentReliableAckSequences.length = 0;
            };
        }
    }
    close() {
        if (this.ackTimeout) {
            clearTimeout(this.ackTimeout);
        }
        this.hasAcks = false;
        this.sentOrderedAckSequences.length = 0;
        this.sentReliableAckSequences.length = 0;
    }
    sendAcks() {
        if (this.hasAcks) {
            this.dataChannel.send(msgpack.encode([3 /* ACK_SYNC */, ...this.sentOrderedAckSequences], [...this.sentReliableAckSequences]));
            this.sentOrderedAckSequences.length = 0;
            this.sentReliableAckSequences.length = 0;
            this.hasAcks = false;
            return true;
        }
        return false;
    }
    sendReliable(message, ordered = false, opts) {
        let seq;
        opts = opts || {};
        let lookup;
        if (ordered) {
            if (++this.nextOrderedSequenceNumber >= 65535) {
                this.nextOrderedSequenceNumber = 1;
            }
            seq = this.nextOrderedSequenceNumber;
            lookup = this.orderedReliableBuffer;
        }
        else {
            if (++this.nextSequenceNumber >= 65535) {
                this.nextSequenceNumber = 1;
            }
            seq = this.nextSequenceNumber;
            lookup = this.reliableBuffer;
        }
        const buffer = msgpack.encode([...message, seq]);
        this._sendReliable(buffer, lookup, seq, 0, { retryRate: opts.retryRate, firstRetryRate: opts.retryRate });
    }
    _sendReliable(message, lookup, seq, retry, opts) {
        opts = opts || {};
        const retryRate = opts.retryRate || 5;
        if (retry === 0) {
            const firstRetryRate = opts.firstRetryRate || retryRate;
            lookup[seq] = {
                message,
                timeout: setTimeout(() => {
                    this._sendReliable(message, lookup, seq, 1, { retryRate });
                }, firstRetryRate),
            };
        }
        else {
            lookup[seq].timeout = setTimeout(() => {
                this._sendReliable(message, lookup, seq, ++retry, { retryRate });
            }, retryRate);
        }
        this.dataChannel.send(message);
    }
    send(data, reliable, ordered) {
        if (reliable || ordered) {
            this.sendReliable(data, ordered);
        }
        else {
            this.dataChannel.send(data);
        }
    }
    handleReceivedReliable(seq, receivedMessage) {
        if (seq === this.nextReliableSeqToReceive) {
            this._onMessageCallback(receivedMessage);
            this.nextReliableSeqToReceive = seq + 1;
            while (this.bufferedReliable.length && this.bufferedReliable[0].seq === this.nextReliableSeqToReceive) {
                this.nextReliableSeqToReceive++;
                const next = this.bufferedReliable.unshift();
                this._onMessageCallback(next);
            }
            this.sendAckSeq = this.nextReliableSeqToReceive - 1;
        }
        else if (seq > this.nextReliableSeqToReceive) {
            this.bufferedReliable.push({ seq, message: receivedMessage });
        }
        else {
            throw new Error(`Seq should not be lower than the receivedReliableSeq.`);
        }
    }
    _messageHandler(msg) {
        const decoded = msgpack.decode(new Uint8Array(msg.data));
        const msgType = decoded[0];
        if (msgType === 3 /* ACK_SYNC */) {
            this.receivedAcks(decoded.slice(1, decoded.length - 1), decoded.pop());
        }
        else {
            if (msgType <= 5) {
                // unordered unreliable message, no acks needed, emit and return..
                return this._onMessageCallback(decoded);
            }
            this.hasAcks = true;
            const seq = decoded.pop();
            if (msgType < 12) { // 12 is max reliable protocol
                !this.sentReliableAckSequences.includes(seq) && this.sentReliableAckSequences.push(seq);
                if (seq > this.lowestUnorderedSeqProcessed && !this.alreadyProcessedReliableSeqs[seq]) {
                    this.alreadyProcessedReliableSeqs[seq] = true;
                    this._onMessageCallback(decoded);
                    while (this.alreadyProcessedReliableSeqs[this.lowestUnorderedSeqProcessed + 1]) {
                        delete this.alreadyProcessedReliableSeqs[++this.lowestUnorderedSeqProcessed];
                    }
                }
            }
            else { // 12 is max reliable ordered protocol
                !this.sentOrderedAckSequences.includes(seq) && this.sentOrderedAckSequences.push(seq);
                // todo: check if we went over the 65535 max meaning the seq reset.
                if (seq <= this.lastAckSequenceNumber)
                    return;
                // we received the next needed ack sequence.
                if (this.lastAckSequenceNumber === seq - 1) {
                    this.lastAckSequenceNumber = seq;
                    this._onMessageCallback(decoded);
                    // do callback for all sequences we already received.
                    while (this.receivedOutOfOrderSeq.length && this.receivedOutOfOrderSeq[0].seq === this.lastAckSequenceNumber + 1) {
                        this._onMessageCallback(this.receivedOutOfOrderSeq.shift().message);
                        this.lastAckSequenceNumber++;
                    }
                }
                else {
                    let insertedAt = -1;
                    for (let i = 0; i < this.receivedOutOfOrderSeq.length; i++) {
                        if (seq === this.receivedOutOfOrderSeq[i].seq)
                            return;
                        if (seq < this.receivedOutOfOrderSeq[i].seq) {
                            insertedAt = i;
                            this.receivedOutOfOrderSeq.splice(i, 0, { seq, message: decoded });
                            break;
                        }
                    }
                    if (insertedAt < 0) {
                        this.receivedOutOfOrderSeq.push({ seq, message: decoded });
                    }
                }
                return;
            }
        }
    }
    onMessage(cb) {
        this._onMessageCallback = cb;
        if (this.dataChannel) {
            this.dataChannel.onmessage = this._messageHandler.bind(this);
        }
    }
    receivedAcks(awaitingReliable, awaitingOrdered) {
        awaitingReliable.forEach(seq => {
            if (this.reliableBuffer[seq]) {
                clearTimeout(this.reliableBuffer[seq].timeout);
                delete this.reliableBuffer[seq];
            }
        });
        awaitingOrdered.forEach(ack => {
            if (this.orderedReliableBuffer[ack]) {
                clearTimeout(this.orderedReliableBuffer[ack].timeout);
                delete this.orderedReliableBuffer[ack];
            }
        });
    }
    _onOpen(data) {
        this._onOpenCallback(data);
    }
    onOpen(cb) {
        this._onOpenCallback = cb;
    }
    checkAck(seq) {
    }
}
exports.WebRTCConnection = WebRTCConnection;
