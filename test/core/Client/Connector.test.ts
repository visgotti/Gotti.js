import { Connector } from '../../../src/core/WebClient/Connector';
import { createDummyNetworkClientProcess, system_names } from '../../mocks';
import { DummySystem1, DummySystem2 } from '../../mocks/client/dummySystems';

import { PeerConnection } from "../../../src/core/WebClient/PeerConnection";

import { Protocol } from "../../../src/core/WebClient/Protocol";

import * as msgpack from "../../../src/core/WebClient/msgpack";

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

let dummyAuth = {
    gottiId: 'test',
    playerIndex: 1,
    connectorUrl: '',
};

const dummySystemName = system_names[0];
const dummySystemName2 = system_names[1];

let onPeerConnectionRejectedProcessSpy;
let onPeerConnectionRejectedSystemSpy;
let onPeerConnectionRejectedSystemSpy2;

let onPeerDisconnectionProcessSpy;

let onPeerDisconnectionSystemSpy;


describe('WebClient/Connector', function() {
    let client;
    let process;
    let connector;
    let system;
    let system2;

    before('stubs out PeerConnection methods', () => {
        sinon.stub(PeerConnection.prototype, 'requestConnection');
        sinon.stub(PeerConnection.prototype, 'acceptConnection');
    })

    beforeEach('creates mock process and client then gets connector from client and stubs out networked functions with spies', (done) => {
        process = createDummyNetworkClientProcess();

        process.addSystem(DummySystem1);
        process.addSystem(DummySystem2);
        system = process.systems[dummySystemName];
        system2 = process.systems[dummySystemName2];

        connector = new Connector();

        done();
    });

    describe('connector.connect', () => {
        it('returns asynchronously when onMessageCallback is called with a JOIN_CONNECTOR protocol', (done) => {
            connector.connect(dummyAuth, process).then(data => {
                assert.deepStrictEqual(data, { areaData: { foo: 'bar' }, joinData: { bar: 'baz'} });
                done();
            });
            setTimeout(() => {
                connector.onMessageCallback({ data: msgpack.encode([Protocol.JOIN_CONNECTOR, { foo: 'bar'}, { bar: 'baz'}]) });
            }, 20)
        });
    });

    describe('connector.requestPeerConnection', () => {
        it('Should add a pending connection and an actual connection that isnt opened', () => {
            const cb = () => {};
            connector.requestPeerConnection(10, dummySystemName, {}, cb);
            assert.deepStrictEqual(connector.pendingPeerRequests[10], cb);
            assert.strictEqual(10 in connector.peerConnections, true);
        })

        /*
        it.only('testing encoding and decoding times', () => {
            let start = Date.now();
            let encoded = [];
            for(let i = 0; i < 20; i++) {
                encoded.push(msgpack.encode([234, 234324, 224, 234, 234,[5345,3345345,24323, 234234,234,324234,234234,234234234234],[234234234,234234234],{ x: 21042345, y: 21042345, sequence: 100324, other: "yes", okay: "nooo2" }, 345345]))
            }
            console.log('it took', Date.now() - start, 'to encode');

            start = Date.now();
            let decoded = [];
            for(let i = 0; i < encoded.length; i++) {
                decoded.push(msgpack.decode(encoded[i]));
            }
            console.log('it took', Date.now() - start, 'to decode');

            assert.strictEqual(true, true);
        })

         */
    });
});

