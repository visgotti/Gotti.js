import Process from '../../src/core/Process';

import * as assert from 'assert';
import * as mocha from 'mocha';

describe('MessageQueue', function() {

    let serverProcess;
    let clientProcess;
    let serverMessageQueue;
    let clientMessageQueue;
    before('starts a mock server and client process.', (done) => {
        serverProcess = new Process();
        clientProcess = new Process();
        done();
    });

    describe('MessageQueue on Client Side', () => {
        describe('messageQueue.addSystem', () => {
            it('succesfully adds system to message queue', (done) => {
                clientMessageQueue.addSystem();
                clientMessageQueue.systems.hasOwnProperty()
            });
        });

        describe('messageQueue.add', () => {
            it('adds message to queue', (done) => {
            });
        });

        describe('messageQueue.dispatch', () => {
            it('calls onMessage of local systems when included in to', (done) => {
            });
            it('does not call onMessage of local systems when included in to', (done) => {
            });
            it('calls remote onMessage of remote system messaged', (done) => {
            });
        });
    });

    describe('MessageQueue on Server Side', () => {
        describe('messageQueue.addSystem', () => {
            it('succesfully adds system to message queue', (done) => {
            });
        });

        describe('messageQueue.addLocal', () => {
            it('adds local message to queue', (done) => {
            });
        });

        describe('messageQueue.addRemote', () => {
            it('adds message to client message queue.', (done) => {
            });
        });

        describe('messageQueue.dispatch', () => {
            it('calls onMessage of local systems when included in to', (done) => {
            });
            it('does not call onMessage of local systems when included in to', (done) => {
            });
            it('calls remote onMessage of remote system messaged', (done) => {
            });
        });
    });
});