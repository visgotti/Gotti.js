import System from '../../../src/core/System/System';
import { MockSystemNames } from './';
import { MockMessageQueue } from '../MessageQueue';
export class MockSystem1 extends System {
    constructor() {
        super(MockSystemNames[0]);
    }
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public update() {};
    public onMessage(message) {};
    public clear() {};
}