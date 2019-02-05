import { system_names, createDummyClientProcess }  from '../mocks';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe('Client Process', function() {

    let systemInitializerSpy;
    let startSystemSpy;
    let stopSystemSpy;
    let clientProcess;

    before('creates instance of a client process and sets up spies', (done) => {
        clientProcess = createDummyClientProcess();
        systemInitializerSpy = sinon.spy(clientProcess, 'systemInitializer');
        startSystemSpy = sinon.spy(clientProcess, '_startSystem');
        stopSystemSpy = sinon.spy(clientProcess, '_stopSystem');
        done();
    });

    describe('clientProcess.initialize()', () => {
        before('initializes process', () => {
            clientProcess.initialize();
        });
        it('should have called systemInitializer for each system', (done) => {
            sinon.assert.callCount(systemInitializerSpy, system_names.length);
            done();
        });
        it('sets clientProcess.systemInitializedOrder', (done) => {
            let counted = 0;
            let expectedCounted = system_names.length;
            for(let i = 0; i < system_names.length; i++) {
                counted++;
                assert.strictEqual(clientProcess.systemInitializedOrder.get(system_names[i]), i);
            }
            assert.strictEqual(counted, expectedCounted);
            done();
        });
        it('sets clientProcess.systemNames', (done) => {
            assert.strictEqual(clientProcess.systemNames.length, system_names.length);
            assert.deepStrictEqual(clientProcess.systemNames, system_names);
            done();
        });
        it('has initialized systems in clientProcess.stoppedSystems', (done) => {
            assert.strictEqual(clientProcess.stoppedSystems.size, system_names.length);
            done();
        });
        it('does not have systems in clientProcess.startedSystems', (done) => {
            assert.strictEqual(clientProcess.startedSystems.length, 0);
            done();
        });
        it('throws if you try to initialize a system multiple times ', (done) => {
            assert.throws( () => { clientProcess.initialize() } );
            done();
        });
    });
    describe('clientProcess.startAllSystems', () => {
        before(() => {
            clientProcess.startAllSystems();
        });
        it('called clientProcess.startSystem for each system', (done) => {
            sinon.assert.callCount(startSystemSpy, system_names.length);
            done();
        });
        it('removes all system names from stoppedSystems', (done) => {
            assert.strictEqual(clientProcess.stoppedSystems.size, 0);
            done();
        });
        it('adds all systems to started in initialization order', (done) => {
            assert.strictEqual(clientProcess.startedSystems.length, system_names.length);
            assert.strictEqual(clientProcess.startedSystemsLookup.size, system_names.length);
            done();
        });
    });
    describe('clientProcess.stopAllSystems', () => {
        before(() => {
            clientProcess.stopAllSystems();
        });
        it('called clientProcess.stopSystem for each system', (done) => {
            sinon.assert.callCount(stopSystemSpy, system_names.length);
            done();
        });
        it('removes all started systems from lookup and array', (done) => {
            assert.strictEqual(clientProcess.startedSystems.length, 0);
            assert.strictEqual(clientProcess.startedSystemsLookup.size, 0);
            done();
        });
        it('added system names back to stopped systems', (done) =>{
            assert.strictEqual(clientProcess.stoppedSystems.size, system_names.length);
            done();
        });
    });
    describe('clientProcess.startSystem', () => {
        it('calls to add systems out of initialization order but they are inserted in order', (done) =>{
            clientProcess.startSystem(system_names[2]); // add last system first
            assert.strictEqual(clientProcess.startedSystems[0].name, system_names[2]);
            clientProcess.startSystem(system_names[0]); // then add first system
            // confirm it was re-ordered
            assert.strictEqual(clientProcess.startedSystems[0].name, system_names[0]);
            assert.strictEqual(clientProcess.startedSystems[1].name, system_names[2]);

            // add second element in array to make sure its put in order still.
            clientProcess.startSystem(system_names[1]); // then add first system
            assert.strictEqual(clientProcess.startedSystems[0].name, system_names[0]);
            assert.strictEqual(clientProcess.startedSystems[1].name, system_names[1]);
            assert.strictEqual(clientProcess.startedSystems[2].name, system_names[2]);
            done();
        });
        it('removed systems from stoppedSystems', (done) => {
            assert.strictEqual(clientProcess.stoppedSystems.size, 0);
            done();
        });
    });
});


