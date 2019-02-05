import { WebClient } from '../../src/core/WebClient';
import { MessageQueue } from '../../src/core/MessageQueue';

import { createDummyClientSystem, system_names, Messages } from '../mocks';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe.only('ClientSystem', function() {

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

});
