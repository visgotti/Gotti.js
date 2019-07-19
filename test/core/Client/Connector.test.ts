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


describe.only('WebClient/Connector', function() {
    let client;
    let process;
    let connector;
    let system;
    let system2;

    before('stubs out PeerConnection methods', () => {
        sinon.stub(PeerConnection.prototype, 'startSignaling');
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

    describe('connector.startPeerConnection', () => {
        it('Should add a pending connection and an actual connection that isnt opened', () => {
            connector.startPeerConnection(10, dummySystemName, {}, { foo: "bar" });
            assert.strictEqual(connector.pendingPeerConnections[10], dummySystemName);
            assert.strictEqual(10 in connector.peerConnections, true);
        })
    });

    describe('connector.stopPeerConnection', () => {
        beforeEach('adds process to connector and starts a peer connection', () => {
            connector.process = process;
            connector.startPeerConnection(10, dummySystemName, {}, { foo: "bar" });
            assert.strictEqual(connector.pendingPeerConnections[10], dummySystemName);
            assert.strictEqual(10 in connector.peerConnections, true);

            onPeerConnectionRejectedProcessSpy = sinon.spy(process, 'onPeerConnectionRejected');
            onPeerConnectionRejectedSystemSpy = sinon.spy(system, 'onPeerConnectionRejected')
            onPeerConnectionRejectedSystemSpy2 = sinon.spy(system2, 'onPeerConnectionRejected')
        });
        it('calls which removes pendingPeerConnections peerConnections', () => {
            connector.stopPeerConnection(10);
            assert.strictEqual(10 in connector.pendingPeerConnections, false);
            assert.strictEqual(10 in connector.peerConnections, false);
            sinon.assert.calledOnce(onPeerConnectionRejectedProcessSpy);
            sinon.assert.calledWithExactly(onPeerConnectionRejectedProcessSpy, 10, dummySystemName);
            sinon.assert.calledOnce(onPeerConnectionRejectedSystemSpy);
            sinon.assert.calledWithExactly(onPeerConnectionRejectedSystemSpy, 10);
        });
        it('doesnt trigger on any systems other than the one where the request came from', () => {
            connector.stopPeerConnection(10);
            assert.strictEqual(10 in connector.pendingPeerConnections, false);
            assert.strictEqual(10 in connector.peerConnections, false);
            sinon.assert.callCount(onPeerConnectionRejectedSystemSpy2, 0);
        })
    });
});

