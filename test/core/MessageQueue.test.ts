
import { ClientMessageQueue } from '../../src/core/ClientMessageQueue';

import { createDummyClientSystem, system_names, Messages } from '../mocks';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe('ClientMessageQueue', function() {

    let messageQueue;

    let mockSystem1;
    let mockSystem2;
    let mockSystem3;

    let mockSystem1_onLocalMessageSpy;
    let mockSystem2_onLocalMessageSpy;
    let mockSystem3_onLocalMessageSpy;

    let mockSystem1_onRemoteMessageSpy;
    let mockSystem2_onRemoteMessageSpy;
    let mockSystem3_onRemoteMessageSpy;


    before('Creates a message queue, mock systems with spies, and validates mock messages.', (done) => {
        messageQueue = new ClientMessageQueue();

        mockSystem1 = createDummyClientSystem(system_names[0]);
        mockSystem2 = createDummyClientSystem(system_names[1]);
        mockSystem3 = createDummyClientSystem(system_names[2]);

        mockSystem1_onLocalMessageSpy = sinon.spy(mockSystem1, 'onLocalMessage');
        mockSystem2_onLocalMessageSpy = sinon.spy(mockSystem2, 'onLocalMessage');
        mockSystem3_onLocalMessageSpy = sinon.spy(mockSystem3, 'onLocalMessage');

        mockSystem1_onRemoteMessageSpy = sinon.spy(mockSystem1, 'onRemoteMessage');
        mockSystem2_onRemoteMessageSpy = sinon.spy(mockSystem2, 'onRemoteMessage');
        mockSystem3_onRemoteMessageSpy = sinon.spy(mockSystem3, 'onRemoteMessage');

        for(let i = 0; i < Messages.length; i++) {
            const { type, data, to, from } = Messages[i];
            assert.strictEqual(type !== null && type !== undefined, true);
            assert.strictEqual(data !== null && data !== undefined, true);
            assert.strictEqual(to !== null && to !== undefined, true);
            assert.strictEqual(Array.isArray(to), true);
            assert.strictEqual(from !== null && from !== undefined, true);
        }
        done();
    });

    afterEach(() => {
        mockSystem1_onLocalMessageSpy.resetHistory();
        mockSystem2_onLocalMessageSpy.resetHistory();
        mockSystem3_onLocalMessageSpy.resetHistory();
        mockSystem1_onRemoteMessageSpy.resetHistory();
        mockSystem2_onRemoteMessageSpy.resetHistory();
        mockSystem3_onRemoteMessageSpy.resetHistory();
    });

    describe('messageQueue.addSystem', () => {
        it('messageQueue.systems has correct values', (done) => {
            messageQueue.addSystem(mockSystem1);
            assert.strictEqual(messageQueue.systems.hasOwnProperty(system_names[0]), true);
            assert.strictEqual(Object.keys(messageQueue.systems).length, 1);
            done();
        });
        it('adds the rest of the systems correctly', (done) => {
            messageQueue.addSystem(mockSystem2);
            messageQueue.addSystem(mockSystem3);

            assert.strictEqual(messageQueue.systems.hasOwnProperty(system_names[0]), true);
            assert.strictEqual(messageQueue.systems.hasOwnProperty(system_names[1]), true);
            assert.strictEqual(messageQueue.systems.hasOwnProperty(system_names[2]), true);
            assert.strictEqual(Object.keys(messageQueue.systems).length, 3);
            done();
        });
    });

    describe('messageQueue.add', () => {
        it('adds message to queue correctly', (done) => {
            const messageAdded = Messages[0];
            messageQueue.add(messageAdded);
            const { to } = messageAdded;

            assert.strictEqual(to.length > 0, true);

            for(let i = 0; i < to.length; i++) {
                // confirm messages have instance of message for correct systems receiving
                assert.strictEqual(messageQueue.messages[to[i]].length, 1);
                // confirms message is same message passed in
                assert.deepStrictEqual(messageQueue.messages[to[i]][0], messageAdded)
            }
            done();
        });
    });

    describe('messageQueue.removeAllMessages', () => {
        it('removes all messages from queue', (done) => {
            const messageAdded = Messages[0];

            let checked = 0;

            const systemMessages = messageQueue.messages;
            Object.keys(systemMessages).forEach(systemName => {
                if(messageAdded.to.indexOf(systemName) > -1) {
                    // checks to make sure there was messages before the remove function runs.
                    assert.strictEqual(systemMessages[systemName].length > 0, true);
                    checked++;
                }
            });
            // make sure the message added's length was over 0 and that were checking each to.
            assert.strictEqual(messageAdded.to.length > 0, true);
            assert.strictEqual(checked, messageAdded.to.length);

            messageQueue.removeAllMessages();

            checked = 0;
            Object.keys(systemMessages).forEach(systemName => {
                if(messageAdded.to.indexOf(systemName) > -1) {
                    // checks theres no more messages
                    assert.strictEqual(systemMessages[systemName].length, 0);
                    checked++;
                }
            });
            assert.strictEqual(messageAdded.to.length > 0, true);
            assert.strictEqual(checked, messageAdded.to.length);

            done();
        });
    });

    describe('messageQueue.removeSystem', () => {
        after((done) => {
            messageQueue.removeAllMessages();
            messageQueue.addSystem(mockSystem1);
            done();
        });
        it('removes all messages for specified system', (done) => {
            const messageAdded = Messages[0];
            messageQueue.add(messageAdded);

            assert.strictEqual(messageAdded.to.indexOf(mockSystem1.name) > -1, true);
            assert.strictEqual(messageQueue.messages[mockSystem1.name].length > 0, true);
            assert.strictEqual(messageQueue.messages[mockSystem2.name].length > 0, true);

            messageQueue.removeSystem(mockSystem1.name);
            // removed name 1 but name 2 is should still have it.
            assert.strictEqual(mockSystem1.name in messageQueue.messages, false);
            assert.strictEqual(messageQueue.messages[mockSystem2.name].length > 0, true);

            done();
        });
    });

    describe('messageQueue.removeAllSystemsAndMessages', () => {
        after((done) => {
            messageQueue.addSystem(mockSystem1);
            messageQueue.addSystem(mockSystem2);
            messageQueue.addSystem(mockSystem3);
            done();
        });
        it('removes all systems', (done) => {
            const messageAdded = Messages[0];
            messageQueue.add(messageAdded);

            assert.strictEqual(messageAdded.to.indexOf(mockSystem1.name) > -1, true);
            assert.strictEqual(messageQueue.messages[mockSystem1.name].length > 0, true);
            assert.strictEqual(messageQueue.messages[mockSystem2.name].length > 0, true);
            assert.strictEqual(messageQueue.messages[mockSystem3.name].length > 0, true);

            messageQueue.removeAllSystemsAndMessages();
            // removed name 1 but name 2 is should still have it.
            assert.strictEqual(mockSystem1.name in messageQueue.messages, false);
            assert.strictEqual(mockSystem2.name in messageQueue.messages, false);
            assert.strictEqual(mockSystem3.name in messageQueue.messages, false);
            done();
        });
    });

    describe('messageQueue.dispatch', () => {
        it('empties out queued messages for system when dispatched', (done) => {
            const messageAdded = Messages[0];
            messageQueue.add(messageAdded);

            const { to } = messageAdded;
            assert.strictEqual(to.length > 0, true);

            for(let i = 0; i < to.length; i++) {
                // confirem it was greater than 0 before
                assert.strictEqual(messageQueue.messages[to[i]].length > 0, true);
                messageQueue.dispatch(to[i]);
                assert.strictEqual(messageQueue.messages[to[i]].length, 0);
            }

            sinon.assert.calledOnce(mockSystem1_onLocalMessageSpy);
            sinon.assert.calledOnce(mockSystem2_onLocalMessageSpy);
            sinon.assert.calledOnce(mockSystem3_onLocalMessageSpy);

            done();
        });
    });

    describe('messageQueue.addAll', () => {
        it('adds a message to all systems and calls it when dispatched', (done) => {
            const messageAdded = Messages[0];
            messageQueue.addAll(messageAdded.type, messageAdded.type, messageAdded.from);

            for(let i = 0; i < messageAdded.to.length; i++) {
                // confirem it was greater than 0 before
                assert.strictEqual(messageQueue.messages[messageAdded.to[i]].length > 0, true);
                messageQueue.dispatch(messageAdded.to[i]);
                assert.strictEqual(messageQueue.messages[messageAdded.to[i]].length, 0);
            }

            sinon.assert.calledOnce(mockSystem1_onLocalMessageSpy);
            sinon.assert.calledOnce(mockSystem2_onLocalMessageSpy);
            sinon.assert.calledOnce(mockSystem3_onLocalMessageSpy);

            done();
        });
    });

    describe('messageQueue.instantDispatch', () => {
        it('dispatches message instantly to system', (done) => {
            const messageAdded = Messages[1]; // just sends to system 2
            messageQueue.instantDispatch(messageAdded);
            sinon.assert.callCount(mockSystem1_onLocalMessageSpy, 0);
            sinon.assert.callCount(mockSystem3_onLocalMessageSpy, 0);
            sinon.assert.calledOnce(mockSystem2_onLocalMessageSpy);
            done();
        });
    });

    describe('messageQueue.instantDispatchAll', () => {
        it('dispatches message instantly to all systems', (done) => {
            const messageAdded = Messages[0];
            messageQueue.instantDispatchAll(messageAdded.type, messageAdded.type, messageAdded.from);

            sinon.assert.calledOnce(mockSystem1_onLocalMessageSpy);
            sinon.assert.calledOnce(mockSystem2_onLocalMessageSpy);
            sinon.assert.calledOnce(mockSystem3_onLocalMessageSpy);
            done();
        });
    });

    describe('messageQueue.instantDispatchAll', () => {
        it('dispatches message instantly to all systems', (done) => {
            const messageAdded = Messages[0];
            messageQueue.instantDispatchAll(messageAdded.type, messageAdded.type, messageAdded.from);

            sinon.assert.calledOnce(mockSystem1_onLocalMessageSpy);
            sinon.assert.calledOnce(mockSystem2_onLocalMessageSpy);
            sinon.assert.calledOnce(mockSystem3_onLocalMessageSpy);
            done();
        });
    });

    describe('messageQueue.addRemote', () => {
        it('calls the onRemoteMessage for the system', (done) => {
            const { type, data, to, from } = Messages[0];
            messageQueue.addRemote(type, data, to, from);

            for(let i = 0; i < to.length; i++) {
                // confirem it was greater than 0 before
                assert.strictEqual(messageQueue.remoteMessages[to[i]].length > 0, true);
                messageQueue.dispatch(to[i]);
                assert.strictEqual(messageQueue.remoteMessages[to[i]].length, 0);
            }

            sinon.assert.calledOnce(mockSystem1_onRemoteMessageSpy);
            sinon.assert.calledOnce(mockSystem2_onRemoteMessageSpy);
            sinon.assert.calledOnce(mockSystem3_onRemoteMessageSpy);
            done();
        });
    })
});