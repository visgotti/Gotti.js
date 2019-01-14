import { Client } from '../../src/core/Process';
import { MockSystem1, MockSystem2, MockSystem3 } from '../mocks';

export class MockClient extends Client {
    constructor() {
        super({});
    }

    public initialize() {
        this.initializeSystem(new MockSystem1());
        this.initializeSystem(new MockSystem2());
        this.initializeSystem(new MockSystem3());
    }
}