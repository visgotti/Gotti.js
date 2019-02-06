import { WebClient } from '../../src/core/WebClient';
import { MessageQueue } from '../../src/core/MessageQueue';

import { createDummyClientSystem, system_names, Messages } from '../mocks';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe('ClientSystem', function() {

    let messageQueue;
    let client;
    let mockSystem1;
    let mockSystem2;
    let mockSystem3;

    let mockSystem1_onLocalMessageSpy;
    let mockSystem2_onLocalMessageSpy;
    let mockSystem3_onLocalMessageSpy;

    beforeEach('Creates dummy systems and inits a web client', (done) => {
        messageQueue = new MessageQueue();

        client = new WebClient('/');

        mockSystem1 = createDummyClientSystem(system_names[0]);
        mockSystem2 = createDummyClientSystem(system_names[1]);
        mockSystem3 = createDummyClientSystem(system_names[2]);

        done();
    });

    describe('clientSystem.initialize', () => {
        it('ran messageQueue.addSystem', (done) => {
            let messageQueue_addSystemSpy = sinon.spy(messageQueue, 'addSystem');
            mockSystem1.initialize(client, messageQueue, client);
            sinon.assert.calledOnce(messageQueue_addSystemSpy);
            done();
        });
        it('ran clientSystem.onInit function', (done) => {
            let clientSystem_onInitSpy = sinon.spy(mockSystem1, 'onInit');
            mockSystem1.initialize(client, messageQueue, client);
            sinon.assert.calledOnce(clientSystem_onInitSpy);
            done();
        });
    });

    describe('clientSystem.addListenStatePaths', () => {
        beforeEach('initialize system', (done) => {
            mockSystem1.initialize(client, messageQueue, client);
            done();
        });
        it('calls the webClient addSystemPathHandler once when passing in a string path', (done) => {
            let client_AddSystemPathHandlerSpy = sinon.spy(client, 'addSystemPathListener');
            mockSystem1.addListenStatePaths('/foo');
            sinon.assert.calledOnce(client_AddSystemPathHandlerSpy);
            client_AddSystemPathHandlerSpy.restore();
            done();
        });
        it('calls the webClient addSystemPathHandler array.length times when passing in array of paths', (done) => {
            let paths = ['/foo', '/bar', '/baz'];
            let client_AddSystemPathHandlerSpy = sinon.spy(client, 'addSystemPathListener');
            mockSystem1.addListenStatePaths(paths);
            sinon.assert.callCount(client_AddSystemPathHandlerSpy, paths.length);
            client_AddSystemPathHandlerSpy.restore();
            done();
        });
    });
});
