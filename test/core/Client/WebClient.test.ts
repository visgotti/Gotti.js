import { Client } from '../../../src/core/WebClient/Client';
import {createDummyOfflineClientProcess, createDummyNetworkClientProcess, system_names} from '../../mocks';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import {DummySystem1, DummySystem2, DummySystem3, DummySystem4} from "../../mocks/client/dummySystems";

const processFiles = [{
    isNetworked: false,
    type: 'game1',
    systems: [DummySystem1],
    areas: [{
        type: 'area1',
        systems: [DummySystem2]
    }, {
        type: 'area2',
        systems: [DummySystem3]
    }, {
        type: 'area3',
        systems: [DummySystem2, DummySystem3, DummySystem4],
    }],
    globals: async (gameData, client) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve({
                    global: 'variable',
                    gameData,
                })
            }, 1)
        })
    },
}];

describe('Creates a web client', function() {
    let client;
    let offlineProcess;
    const offlineProcessKey = 'game1';

    beforeEach('creates instance of a client, a dummy offline process and a dummy networked process', (done) => {
        client = new Client('/', processFiles);
        done();
    });
    describe('client.startGame', () => {
        it('successfully starts process of offline process', (done) => {
            let startGameProcessSpy = sinon.spy(client, 'startGameProcess');
            let joinConnectorSpy = sinon.spy(client, 'joinConnector');
            let startAllSystemsSpy = sinon.spy(offlineProcess, '_startAllSystems');
            let tickSpy = sinon.spy(offlineProcess, 'tick');

            // hasnt ticked yet
            assert.strictEqual(tickSpy.callCount, 0);
            client.offlineGame(offlineProcessKey, { weapons: [1,2,3]}).then(() => {

                // shouldnt join connector since its an offline game
                sinon.assert.callCount(joinConnectorSpy, 0);

                // not quite sure best way to predict this behavior better than
                // just knowing it called tick at least once.
                assert.strictEqual(tickSpy.callCount > 0, true);
                assert.deepStrictEqual(client.runningProcess.globals, {
                    global: 'variable',
                    gameData: {
                        weapons: [1, 2, 3]
                    },
                })
                done();
            });
        });
    });
    describe('client.clearGame', () => {
        it('Successfully stops a started process', (done) => {
            client.startOfflineGame(offlineProcessKey).then(() => {
                assert.deepStrictEqual(client.runningProcess, client.processes[offlineProcessKey]);
                assert.doesNotThrow(() => {client.clearGame() });
                // sets running process to null
                assert.strictEqual(client.runningProcess, null);
                // make sure the process is still kept as a reference
                assert.notStrictEqual(client.processes[offlineProcessKey], null);
                done();
            });
        });
    })
});

