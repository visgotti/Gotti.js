import { ClientProcess } from '../../../src/core/Process/Client';
import { WebClient } from '../../../src/core/WebClient';

import { createDummyClientSystem } from './createDummySystem';

import { system_names } from '../';
class MockClient extends ClientProcess {
    constructor() {
        super(new WebClient('test'));
    }

    public initialize() {
        system_names.forEach(name => {
            this.initializeSystem(createDummyClientSystem(name));
        });
    }
}

export function createDummyClientProcess() {
    return new MockClient();
}