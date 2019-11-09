import { DummySystem1, DummySystem2, DummySystem3, DummySystem4 } from '../../mocks/client/dummySystems';
import * as assert from 'assert';
import * as mocha from 'mocha';

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
    globals: async (gameData, areaData, client) => {
        console.log('running g')
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve({
                    client,
                    global: 'variable',
                    options: { gameData, areaData},
                })
            }, 1)
        })
    },
}];

describe('Client Process with globals', function() {
    let processManager;
    let startedSystems;
    let stoppedSystems;
    let systems;
    describe('Game Type game1', () => {
        beforeEach('gets process manager after initializing a client', async() => {
            processManager = new Client('/', processFiles)['processManager'];
            await processManager.initializeGame('game1', 'gameData', {
                'area1_id': { data: 'areaData', type: 'area1'},
                'area2_id': { data: 'areaData', type: 'area2'},
                'area3_id': { data: 'areaData', type: 'area3'}
            });
            ({ startedSystems, stoppedSystems, systems } = processManager.runningGameProcess);
            const systemConstructors = [DummySystem1, DummySystem2, DummySystem3, DummySystem4];
        });
        describe('ProcessManager.initializeGame', () => {
            it('Only starts the game systems', async() => {
                processManager.startCurrentGameSystems({});
                assert.strictEqual(startedSystems.length, 1);
                assert.strictEqual(stoppedSystems.length, 3);
                assert.strictEqual(Object.keys(systems).length, 4);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem1), true);
            });
            it('Added globals to system', () => {
                for(let systemName in systems) {
                    const system = systems[systemName];
                    assert.deepStrictEqual(system.globals.global, 'variable');
                    assert.deepStrictEqual(system.globals.options, {
                        'gameData': 'gameData',
                        'areaData': {
                            'area1_id': { data: 'areaData', type: 'area1'},
                            'area2_id': { data: 'areaData', type: 'area2'},
                            'area3_id': { data: 'areaData', type: 'area3'}
                        }
                    });
                    assert.strictEqual(system.globals.client, processManager.client);
                    assert.deepStrictEqual(Object.keys(system.globals).length, 3);
                }
            })
        });
        describe('ProcessManager.changeAreaProcess', () => {
            beforeEach('starts current game systems',() => {
                processManager.startCurrentGameSystems();
            });
            it('Starts DummySystem2 for area1 but not DummySystem3, or DummySystem4',  () => {
                processManager.startAreaSystems('area1_id');
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
            });
            it('Starts DummySystem3 for area2 but not  DummySystem2, or DummySystem4',  () => {
                processManager.startAreaSystems('area2_id');
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), true);
            });
            it('Starts area 1 and Dummysystem2 but stops it when it starts area 2 and DummySystem3', () => {
                processManager.startAreaSystems('area1_id');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
                processManager.removeAreaSystems('area1_id');
                processManager.startAreaSystems('area2_id');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
            });
            it('Starts area1 and DummySystem2 and when area3 starts it doesnt stop it but also adds DummySystem3 and DummySystem4', () => {
                processManager.startAreaSystems('area1_id');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
                processManager.startAreaSystems('area3_id');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), true);
                assert.strictEqual(startedSystems.length, 4);
                assert.strictEqual(stoppedSystems.length, 0);
            });
            it('Starts area3 DummySystem2, DummySystem3 and DummySystem4 but stops DummySystem3 and DummySystem4', () => {
                processManager.startAreaSystems('area3_id');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), true);
                assert.strictEqual(startedSystems.length, 4);
                assert.strictEqual(stoppedSystems.length, 0);
                processManager.startAreaSystems('area1_id');
                processManager.removeAreaSystems('area3_id');
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem2), true);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem3), false);
                assert.strictEqual(!!startedSystems.find(s => s.constructor === DummySystem4), false);
                assert.strictEqual(startedSystems.length, 2);
                assert.strictEqual(stoppedSystems.length, 2);
            });
        });
    })
});
