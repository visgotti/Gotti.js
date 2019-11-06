import { DummySystem1, DummySystem2, DummySystem3, DummySystem4 } from '../../mocks/client/dummySystems';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

import { ProcessManager } from '../../../src/core/WebClient/ProcessManager';
import { Client } from '../../../src/core/WebClient/Client';

import { TestPlugin } from "../../mocks";

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
    globals: async (gameOptions, client) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve({
                    client,
                    global: 'variable',
                    options: gameOptions,
                })
            }, 1)
        })
    },
}];

describe('Client Process with no globals', function() {
    let processManager;
    let startedSystems;
    let stoppedSystems;
    let systems;
    describe('Game Type game1', () => {
        beforeEach('gets process manager after initializing a client', async() => {
            processManager = new Client('/', processFiles)['processManager'];
            await processManager.initializeGame('game1', 'options');
            ({ startedSystems, stoppedSystems, systems } = processManager.runningGameProcess);
            const systemConstructors = [DummySystem1, DummySystem2, DummySystem3, DummySystem4];
        });
        describe('ProcessManager.startCurrentGameSystems', () => {
            it('Only starts the game systems', async() => {
                processManager.startCurrentGameSystems();
                assert.strictEqual(startedSystems.length, 1);
                assert.strictEqual(stoppedSystems.length, 3);
                assert.strictEqual(Object.keys(systems).length, 4);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem1), true);
            });
            it('Added globals to system', () => {
                for(let systemName in systems) {
                    const system = systems[systemName];
                    assert.deepStrictEqual(system.globals, {
                        client: processManager.client,
                        global: 'variable',
                        options: 'options',
                    });
                    assert.strictEqual(system.globals.client, processManager.client);
                }
            })
        });
        describe('ProcessManager.changeAreaProcess', () => {
            beforeEach('starts current game systems',() => {
                processManager.startCurrentGameSystems();
            });
            it('Starts DummySystem2 for area1 but not DummySystem3, or DummySystem4',  () => {
                processManager.changeAreaProcess('area1');
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
            });
            it('Starts DummySystem3 for area2 but not  DummySystem2, or DummySystem4',  () => {
                processManager.changeAreaProcess('area2');
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), true);
            });
            it('Starts area 1 and Dummysystem2 but stops it when it starts area 2 and DummySystem3', () => {
                processManager.changeAreaProcess('area1');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
                processManager.changeAreaProcess('area2');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
            });
            it('Starts area1 and DummySystem2 and when area3 starts it doesnt stop it but also adds DummySystem3 and DummySystem4', () => {
                processManager.changeAreaProcess('area1');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
                processManager.changeAreaProcess('area3');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), true);
                assert.strictEqual(startedSystems.length, 4);
                assert.strictEqual(stoppedSystems.length, 0);
            });
            it('Starts area3 DummySystem2, DummySystem3 and DummySystem4 but stops DummySystem3 and DummySystem4 when we start area1 ', () => {
                processManager.changeAreaProcess('area3');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), true);
                assert.strictEqual(startedSystems.length, 4);
                assert.strictEqual(stoppedSystems.length, 0);
                processManager.changeAreaProcess('area1');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
            });
        });
    })

});
