import {PeerConnection} from "../PeerConnection";
import {IConnectorServerConnection} from "./IConnectorServerConnection";
import {ReturnKeyType} from "tns-core-modules/ui/enums";
import next = ReturnKeyType.next;
import * as msgpack from "../msgpack";
import {Protocol} from "../Protocol";
import {clear} from "tns-core-modules/application-settings";
type ReliableBufferLookup = {
    [seq: number]: {
        timeout: any,
        message: Buffer
    }
}
export class WebRTCConnection implements IConnectorServerConnection {
    private reliableSeq : number = 0;
    private nextReliableSeqToReceive : number = 0;
    private bufferedReliable: Array<{ seq: number, message: any }> = [];
    private sendAckSeq : number;
    private ackTimeout : any;
    private lastSentAckSeq : number;
    private awaitingAcks : {[seq: number]: any }= {};
    private pc : PeerConnection;
    private _onMessageCallback : (msg: any) => void = () => {};
    private _onOpenCallback : (msg: any) => void;
    private reliableSendCount : number = 3;
    private reliableResendTimeout : number = 50;
    private dataChannel : RTCDataChannel;
    private sentReliableAckSequences : Array<number> = [];
    private sentOrderedAckSequences : Array<number> = [];
    private nextSequenceNumber : number = 0;
    private nextOrderedSequenceNumber : number = 0;

    private lastAckSequenceNumber : number = 0;
    private lastAckOrderedSequenceNumber : number = 0;
    private orderedReliableBuffer : ReliableBufferLookup = {};
    private reliableBuffer : ReliableBufferLookup = {} ;
    private receivedOutOfOrderSeq: Array<{ seq: number, message: any }> = [];
    private alreadyProcessedReliableSeqs : {[number: string]: any } = {};
    private lowestUnorderedSeqProcessed: number = 0;

    public hasAcks : boolean = false;

    constructor(peerConnection : PeerConnection) {
        this.pc = peerConnection;
        this.dataChannel = this.pc.dataChannel;
        if(this.dataChannel) {
            this.dataChannel.onmessage = this._messageHandler.bind(this);
            this.dataChannel.onclose = () => {
                if(this.ackTimeout) {
                    clearTimeout(this.ackTimeout);
                }
                this.hasAcks = false;
                this.sentOrderedAckSequences.length = 0;
                this.sentReliableAckSequences.length = 0;
            }
        }
    }
    public close() {
        if(this.ackTimeout) {
            clearTimeout(this.ackTimeout);
        }
        this.hasAcks = false;
        this.sentOrderedAckSequences.length = 0;
        this.sentReliableAckSequences.length = 0;
    }
    public sendAcks() : boolean {
        if(this.hasAcks) {
            this.dataChannel.send(msgpack.encode([Protocol.ACK_SYNC, ...this.sentOrderedAckSequences], [...this.sentReliableAckSequences]));
            this.sentOrderedAckSequences.length = 0;
            this.sentReliableAckSequences.length = 0;
            this.hasAcks = false;
            return true;
        }
        return false;
    }

    public sendReliable(message: Array<any>, ordered=false, opts?: { retryRate?: number, firstRetryRate?: number } ) {
        let seq;
        opts = opts || {};
        let lookup : ReliableBufferLookup;
        if(ordered) {
            if(++this.nextOrderedSequenceNumber >= 65535) { this.nextOrderedSequenceNumber = 1; }
            seq = this.nextOrderedSequenceNumber;
            lookup = this.orderedReliableBuffer;
        } else {
            if(++this.nextSequenceNumber >= 65535) { this.nextSequenceNumber = 1;}
            seq = this.nextSequenceNumber;
            lookup = this.reliableBuffer;
        }
        const buffer = msgpack.encode([...message, seq]);
        this._sendReliable(buffer, lookup, seq, 0, { retryRate: opts.retryRate, firstRetryRate: opts.retryRate })
    }

    private _sendReliable(message: any, lookup: ReliableBufferLookup, seq: number, retry: number, opts?: { retryRate?: number, firstRetryRate?: number }) {
        opts = opts || {};
        const retryRate = opts.retryRate || 5;
        if(retry === 0) {
            const firstRetryRate = opts.firstRetryRate || retryRate;
            lookup[seq] = {
                message,
                timeout: setTimeout(() => {
                    this._sendReliable(message, lookup, seq,1, { retryRate });
                }, firstRetryRate),
            }
        } else {
            lookup[seq].timeout = setTimeout(() => {
                this._sendReliable(message, lookup, seq,++retry, { retryRate });
            }, retryRate);
        }
        this.dataChannel.send(message);
    }

    send(data: any, reliable?: boolean, ordered?: boolean): void {
        if(reliable || ordered) {
            this.sendReliable(data, ordered);
        } else {
            this.dataChannel.send(data);
        }
    }

    private _messageHandler(msg) {
        const decoded = msgpack.decode(new Uint8Array(msg.data));
        const msgType = decoded[0];
        if(msgType === Protocol.ACK_SYNC) {
            this.receivedAcks(decoded.slice(1, decoded.length-1), decoded.pop());
        } else {
            if(msgType <= 5) {
                // unordered unreliable message, no acks needed, emit and return..
                return this._onMessageCallback(decoded);
            }
            this.hasAcks = true;
            const seq = decoded.pop();
            if (msgType < 12) { // 12 is max reliable protocol
                !this.sentReliableAckSequences.includes(seq) && this.sentReliableAckSequences.push(seq);
                if(seq > this.lowestUnorderedSeqProcessed && !this.alreadyProcessedReliableSeqs[seq]) {
                    this.alreadyProcessedReliableSeqs[seq] = true;
                    this._onMessageCallback(decoded);
                    while(this.alreadyProcessedReliableSeqs[this.lowestUnorderedSeqProcessed+1]) {
                        delete this.alreadyProcessedReliableSeqs[++this.lowestUnorderedSeqProcessed]
                    }
                }
            } else { // 12 is max reliable ordered protocol
                !this.sentOrderedAckSequences.includes(seq) && this.sentOrderedAckSequences.push(seq);

                // todo: check if we went over the 65535 max meaning the seq reset.
                if(seq <= this.lastAckSequenceNumber) return;

                // we received the next needed ack sequence.
                if(this.lastAckSequenceNumber === seq-1) {
                    this.lastAckSequenceNumber = seq;
                    this._onMessageCallback(decoded);
                    // do callback for all sequences we already received.
                    while(this.receivedOutOfOrderSeq.length && this.receivedOutOfOrderSeq[0].seq === this.lastAckSequenceNumber+1) {
                        this._onMessageCallback(this.receivedOutOfOrderSeq.shift().message);
                        this.lastAckSequenceNumber++;
                    }
                } else {
                    let insertedAt = -1;
                    for(let i = 0; i < this.receivedOutOfOrderSeq.length; i++) {
                        if(seq === this.receivedOutOfOrderSeq[i].seq) return;
                        if(seq < this.receivedOutOfOrderSeq[i].seq) {
                            insertedAt = i;
                            this.receivedOutOfOrderSeq.splice(i, 0, { seq, message: decoded });
                            break;
                        }
                    }
                    if(insertedAt < 0) {
                        this.receivedOutOfOrderSeq.push({ seq, message: decoded })
                    }
                }
                return;
            }
        }
    }
    onMessage(cb: (data: Array<any>) => void): void {
        this._onMessageCallback = cb;
        if(this.dataChannel) {
            this.dataChannel.onmessage = this._messageHandler.bind(this);
        }
    }

    private receivedAcks(awaitingReliable: Array<number>, awaitingOrdered: Array<number>) {
        awaitingReliable.forEach(seq => {
            if(this.reliableBuffer[seq]) {
                clearTimeout(this.reliableBuffer[seq].timeout);
                delete this.reliableBuffer[seq];
            }
        })
        awaitingOrdered.forEach(ack => {
            if(this.orderedReliableBuffer[ack]) {
                clearTimeout(this.orderedReliableBuffer[ack].timeout);
                delete this.orderedReliableBuffer[ack];
            }
        })
    }

    private _onOpen(data?: any) {
        this._onOpenCallback(data)
    }
    onOpen(cb: (data: any) => void): void {
        this._onOpenCallback = cb;
    }
    private checkAck(seq: number) {
    }
}