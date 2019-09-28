import { Client as WebClient } from '../../../src/core/WebClient/Client';
import { ClientMessageQueue } from '../../../src/core/ClientMessageQueue';
import { EntityManager} from "../../../src/core/EntityManager";
import { createDummyClientSystem, system_names, Messages } from '../../mocks';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe('ClientSystem', function() {

    let messageQueue;
    let entityManager;
    let client;
    let mockSystem1;
    let mockSystem2;
    let mockSystem3;

    let mockSystem1_onLocalMessageSpy;
    let mockSystem2_onLocalMessageSpy;
    let mockSystem3_onLocalMessageSpy;

    beforeEach('Creates dummy systems and inits a web client', (done) => {
        messageQueue = new ClientMessageQueue();
        entityManager = new EntityManager({});
        client = new WebClient('/', '');

        mockSystem1 = createDummyClientSystem(system_names[0]);
        mockSystem2 = createDummyClientSystem(system_names[1]);
        mockSystem3 = createDummyClientSystem(system_names[2]);

        done();
    });

    describe('clientSystem.initialize', () => {
        it('ran messageQueue.addSystem', (done) => {
            let messageQueue_addSystemSpy = sinon.spy(messageQueue, 'addSystem');
            mockSystem1.initialize(client, messageQueue, entityManager, false, client);
            assert.strictEqual(mockSystem1.isNetworked, false);
            sinon.assert.calledOnce(messageQueue_addSystemSpy);
            done();
        });
        it('ran clientSystem.onInit function', (done) => {
            let clientSystem_onInitSpy = sinon.spy(mockSystem1, 'onInit');
            mockSystem1.initialize(client, messageQueue, entityManager, true, client);
            assert.strictEqual(mockSystem1.isNetworked, true);
            sinon.assert.calledOnce(clientSystem_onInitSpy);
            done();
        });
    });

    describe('clientSystem.addListenStatePaths', () => {
        beforeEach('initialize system', (done) => {
            mockSystem1.initialize(client, messageQueue, entityManager, true, client);
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

    describe('clientSystem.installPlugin', () => {
        const plugin = {
            name: "testPlugin",
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
    })

});
