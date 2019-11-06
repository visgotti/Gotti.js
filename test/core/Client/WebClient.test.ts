import { Client } from '../../../src/core/WebClient/Client';
import {createDummyOfflineClientProcess, createDummyNetworkClientProcess, system_names} from '../../mocks';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe('Creates a web client', function() {
    let client;
    let networkedProcess;
    let offlineProcess;
    const offlineProcessKey = 'offline';
    const networkedProcessKey = 'network';

    beforeEach('creates instance of a client, a dummy offline process and a dummy networked process', (done) => {
        client = new Client('', []);
        networkedProcess = createDummyNetworkClientProcess();
        offlineProcess = createDummyOfflineClientProcess();
        done();
    });

    describe('client.addGameProcess', () => {
        it('succesfully adds offline process', () => {
           client.addGameProcess(offlineProcessKey, offlineProcess);
           assert.strictEqual(Object.keys(client.processes).length, 1);
           assert.notStrictEqual(client.processes[offlineProcessKey], undefined);
        });
        it('succesfully adds online process', () => {
            client.addGameProcess(networkedProcessKey, networkedProcess);
            assert.strictEqual(Object.keys(client.processes).length, 1);
            assert.notStrictEqual(client.processes[networkedProcessKey], undefined);
        });
        it('fails to add a process with a duplicate name', () => {
            assert.doesNotThrow(() => { client.addGameProcess(offlineProcessKey, offlineProcess)});
            assert.throws(() => { client.addGameProcess(offlineProcessKey, offlineProcess)});
        });
    });
    describe('client.startGame', () => {
        it('successfully starts process of offline process', (done) => {
            client.addGameProcess(offlineProcessKey, offlineProcess);
            let startGameProcessSpy = sinon.spy(client, 'startGameProcess');
            let joinConnectorSpy = sinon.spy(client, 'joinConnector');
            let startAllSystemsSpy = sinon.spy(offlineProcess, '_startAllSystems');
            let tickSpy = sinon.spy(offlineProcess, 'tick');

            // hasnt ticked yet
            assert.strictEqual(tickSpy.callCount, 0);

            client.startGame(offlineProcessKey).then(() => {
                sinon.assert.callCount(startGameProcessSpy, 1);
                sinon.assert.callCount(startAllSystemsSpy, 1);

                // shouldnt join connector since its an offline game
                sinon.assert.callCount(joinConnectorSpy, 0);

                // not quite sure best way to predict this behavior better than
                // just knowing it called tick at least once.
                assert.strictEqual(tickSpy.callCount > 0, true);
                done();
            });
        });
    });
    describe('client.stopGame', () => {
        it('Successfully stops a started process', (done) => {
            client.addGameProcess(offlineProcessKey, offlineProcess);
            client.startGame(offlineProcessKey).then(() => {
                assert.deepStrictEqual(client.runningProcess, client.processes[offlineProcessKey]);
                assert.doesNotThrow(() => {client.stopGame() });
                // sets running process to null
                assert.strictEqual(client.runningProcess, null);
                // make sure the process is still kept as a reference
                assert.notStrictEqual(client.processes[offlineProcessKey], null);
                done();
            });
        });
        it('throws an error when no process is started a started process', () => {
            client.addGameProcess(offlineProcessKey, offlineProcess);
            assert.throws(() => {client.stopGame() });
        });
    })
});

