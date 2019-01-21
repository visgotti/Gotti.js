/*
describe('Server Process', function() {

    let server;
    let client;

    let systemInitializerSpy;
    let startSystemSpy;
    let stopSystemSpy;

    before('creates instance of a server process and sets up spies', (done) => {
        server = new Server();
        systemInitializerSpy = sinon.spy(server, 'systemInitializer');
        startSystemSpy = sinon.spy(server, '_startSystem');
        stopSystemSpy = sinon.spy(server, '_stopSystem');
        done();
    });
    */
/*

    describe('server.initialize()', () => {
        before('initializes process', () => {
            server.initialize();
        });
        it('should have called systemInitializer for each system', (done) => {
            sinon.assert.callCount(systemInitializerSpy, MockSystemNames.length);
            done();
        });
        it('sets server.systemInitializedOrder', (done) => {
            let counted = 0;
            let expectedCounted = MockSystemNames.length;
            for(let i = 0; i < MockSystemNames.length; i++) {
                counted++;
                assert.strictEqual(server.systemInitializedOrder.get(MockSystemNames[i]), i);
            }
            assert.strictEqual(counted, expectedCounted);
            done();
        });
        it('sets server.systemNames', (done) => {
            assert.strictEqual(server.systemNames.length, MockSystemNames.length);
            assert.deepStrictEqual(server.systemNames, MockSystemNames);
            done();
        });
        it('has initialized systems in server.stoppedSystems', (done) => {
            assert.strictEqual(server.stoppedSystems.size, MockSystemNames.length);
            done();
        });
        it('does not have systems in server.startedSystems', (done) => {
            assert.strictEqual(server.startedSystems.length, 0);
            done();
        });
        it('throws if you try to initialize a system multiple times ', (done) => {
            assert.throws( () => { server.initialize() } );
            done();
        });
    });
    describe('server.startAllSystems', () => {
        before(() => {
            server.startAllSystems();
        });
        it('called server.startSystem for each system', (done) => {
            sinon.assert.callCount(startSystemSpy, MockSystemNames.length);
            done();
        });
        it('removes all system names from stoppedSystems', (done) => {
            assert.strictEqual(server.stoppedSystems.size, 0);
            done();
        });
        it('adds all systems to started in initialization order', (done) => {
            assert.strictEqual(server.startedSystems.length, MockSystemNames.length);
            assert.strictEqual(server.startedSystemsLookup.size, MockSystemNames.length);
            done();
        });
    });
    describe('server.stopAllSystems', () => {
        before(() => {
            server.stopAllSystems();
        });
        it('called server.stopSystem for each system', (done) => {
            sinon.assert.callCount(stopSystemSpy, MockSystemNames.length);
            done();
        });
        it('removes all started systems from lookup and array', (done) => {
            assert.strictEqual(server.startedSystems.length, 0);
            assert.strictEqual(server.startedSystemsLookup.size, 0);
            done();
        });
        it('added system names back to stopped systems', (done) =>{
            assert.strictEqual(server.stoppedSystems.size, MockSystemNames.length);
            done();
        });
    });
    describe('server.startSystem', () => {
        it('calls to add systems out of initialization order but they are inserted in order', (done) =>{
            server.startSystem(MockSystemNames[2]); // add last system first
            assert.strictEqual(server.startedSystems[0].name, MockSystemNames[2]);
            server.startSystem(MockSystemNames[0]); // then add first system
            // confirm it was re-ordered
            assert.strictEqual(server.startedSystems[0].name, MockSystemNames[0]);
            assert.strictEqual(server.startedSystems[1].name, MockSystemNames[2]);

            // add second element in array to make sure its put in order still.
            server.startSystem(MockSystemNames[1]); // then add first system
            assert.strictEqual(server.startedSystems[0].name, MockSystemNames[0]);
            assert.strictEqual(server.startedSystems[1].name, MockSystemNames[1]);
            assert.strictEqual(server.startedSystems[2].name, MockSystemNames[2]);
            done();
        });
        it('removed systems from stoppedSystems', (done) => {
            assert.strictEqual(server.stoppedSystems.size, 0);
            done();
        });
    });
});
*/