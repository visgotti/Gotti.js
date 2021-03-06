import { system_names, createDummyNetworkClientProcess, createDummyOfflineClientProcess }  from '../../mocks';
import { DummySystem1, DummySystem2, DummySystem3 } from '../../mocks/client/dummySystems';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe('Client Process with no globals', function() {

    let systemInitializerSpy;

    let startSystemSpy;
    let stopSystemSpy;
    let clientProcess;

    before('creates instance of a client process and sets up spies', (done) => {
        clientProcess = createDummyNetworkClientProcess();
        assert.strictEqual(clientProcess.isNetworked, true);
        systemInitializerSpy = sinon.spy(clientProcess, 'systemInitializer');
        startSystemSpy = sinon.spy(clientProcess, '_startSystem');
        stopSystemSpy = sinon.spy(clientProcess, '_stopSystem');

        done();
    });

    describe('clientProcess.addSystem with no globals', () => {
        before(() => {
            clientProcess.addSystem(DummySystem1);
            clientProcess.addSystem(DummySystem2);
            clientProcess.addSystem(DummySystem3);
        });
        it('should have called systemInitializer for each system', (done) => {
            sinon.assert.callCount(systemInitializerSpy, system_names.length);
            done();
        });

        it('should have initialized system with a messageQueue and client', (done) => {
            const system = (clientProcess.systems[system_names[0]]);
            assert.ok(system);
            assert.ok(system.messageQueue);
            assert.ok(system.client);
            assert.ok(system.initialized);
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
            assert.strictEqual(clientProcess.stoppedSystems.length, system_names.length);
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
            assert.strictEqual(clientProcess.stoppedSystems.length, 0);
            done();
        });
        it('adds all systems to started in initialization order', (done) => {
            assert.strictEqual(clientProcess.startedSystems.length, system_names.length);
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
            done();
        });
        it('added system names back to stopped systems', (done) =>{
            assert.strictEqual(clientProcess.stoppedSystems.length, system_names.length);
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
            assert.strictEqual(clientProcess.stoppedSystems.length, 0);
            done();
        });
    });

    describe('clientProcess.addGlobal', () => {
        it('adds global to systems', (done) => {
            clientProcess.addGlobal('foobar', {'foo': 'bar'});
            assert.deepStrictEqual(clientProcess.startedSystems[0].globals.foobar, {'foo': 'bar'});
            assert.deepStrictEqual(clientProcess.startedSystems[1].globals.foobar, {'foo': 'bar'});
            assert.deepStrictEqual(clientProcess.startedSystems[2].globals.foobar, { 'foo': 'bar'});
            done();
        })
    });
    describe('clientProcess.addApi', () => {
        let dummyProcess;
        before(() => {
            dummyProcess = createDummyNetworkClientProcess();
            dummyProcess.addSystem(DummySystem1);
            dummyProcess.addSystem(DummySystem2);
            dummyProcess.addSystem(DummySystem3);
            dummyProcess.startAllSystems();
        });
        it('Binds the added api to the system\'s context that added it', () => {
            dummyProcess.startedSystems[0]['testprop'] = 'system 1';
            dummyProcess.startedSystems[0]['testMethod'] = function () {
                return this.testprop;
            };
            dummyProcess.startedSystems[0].addApi(dummyProcess.startedSystems[0].testMethod, 'testMethod');
            dummyProcess.startedSystems[1]['testprop'] = 'system 2';

            assert.deepStrictEqual(dummyProcess.startedSystems[0].$api.testMethod(), 'system 1');
            assert.deepStrictEqual(dummyProcess.startedSystems[1].$api.testMethod(), 'system 1');
        });
        it('Uses correct name if it was a class method and no name param provided', () => {
            dummyProcess.startedSystems[0]['testprop'] = 'system 1';
            dummyProcess.startedSystems[0].addApi(dummyProcess.startedSystems[0].returnName);
            assert.deepStrictEqual(dummyProcess.startedSystems[0].$api.returnName(), system_names[0]);
            assert.deepStrictEqual(dummyProcess.startedSystems[1].$api.returnName(), system_names[0]);
        });
    });

    describe('clientProcess.serverGameData', () => {
        it('calls the onServerDataUpdated method on started systems', () => {
            const onServerDataUpdatedSystemSpy1 = sinon.spy(clientProcess.startedSystems[0], 'onServerDataUpdated');
            clientProcess.serverGameData = { "foo": "bar" };

            sinon.assert.calledWith(onServerDataUpdatedSystemSpy1, { "foo": "bar"}, {} );
            assert.deepStrictEqual(clientProcess.startedSystems[0].serverGameData, { "foo": "bar"});

            clientProcess.serverGameData = { "foo": "baz" };
            sinon.assert.calledWith(onServerDataUpdatedSystemSpy1, { "foo": "baz"}, { "foo": "bar" } );
            assert.deepStrictEqual(clientProcess.startedSystems[0].serverGameData, { "foo": "baz"});

            sinon.assert.callCount(onServerDataUpdatedSystemSpy1, 2);
        })
    })
});
describe('Client Process with plugins', function() {

    const plugin = {
        name: "testPlugin",
        init() {},
        props() {
            return {
                "testprop": "test"
            }
        },
        methods: {
          test() {
              return this.testprop
          }  
        }
    }
    let clientProcess;
    beforeEach(() => {
        clientProcess = createDummyNetworkClientProcess();
        clientProcess.addSystem(DummySystem1);
        clientProcess.addSystem(DummySystem2);
        clientProcess.addSystem(DummySystem3);
    })
    describe('clientProcess.installPlugin', () => {
        it('adds plugin to all systems if no names are specified as second params', (done) => {
            clientProcess.installPlugin(plugin);
            assert.deepStrictEqual(clientProcess.systems[system_names[0]].$.test(), "test");
            assert.deepStrictEqual(clientProcess.systems[system_names[1]].$.test(), "test");
            assert.deepStrictEqual(clientProcess.systems[system_names[2]].$.test(), "test");
            done();
        })
        it('adds plugin to all systems only to system names specified', (done) => {
            clientProcess.installPlugin(plugin, [system_names[0], system_names[1]]);
            assert.deepStrictEqual(clientProcess.systems[system_names[0]].$.test(), "test");
            assert.deepStrictEqual(clientProcess.systems[system_names[1]].$.test(), "test");
            assert.deepStrictEqual(clientProcess.systems[system_names[2]].$.test, undefined);
            done();
        });
        it('executes init', () => {
            const initSpy = sinon.spy(plugin, 'init');
            clientProcess.installPlugin(plugin);
            sinon.assert.callCount(initSpy, 1);
        })
    });
})

describe('Client Process with globals', function() {

    let systemInitializerSpy;
    let startSystemSpy;
    let stopSystemSpy;
    let clientProcess;

    before('creates instance of a client process and sets up spies', (done) => {
        clientProcess = createDummyOfflineClientProcess({
            "foo": "bar",
            "bar": () => {
                return "baz"
            }
        });
        systemInitializerSpy = sinon.spy(clientProcess, 'systemInitializer');
        done();
    });

    it('makes sure the system was initialized with the global values as properties as well as the initial messageQueue and client', (done) => {
        clientProcess.addSystem(DummySystem1);
        sinon.assert.calledOnce(systemInitializerSpy);

        const system = (clientProcess.systems[system_names[0]]);

        assert.ok(system);
        assert.ok(system.globals.foo);
        assert.strictEqual(system.globals.foo, 'bar');
        assert.ok(system.globals.bar);
        assert.strictEqual(system.globals.bar(), 'baz');

        assert.ok(system.messageQueue);
        assert.ok(system.client);
        assert.ok(system.initialized);
        done();
    });
});

