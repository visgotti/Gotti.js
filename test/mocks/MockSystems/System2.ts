import System from '../../../src/core/System/System';
import { MockSystemNames } from './';
export class MockSystem2 extends System {
    constructor() {
        super(MockSystemNames[1]);
    }
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public update() {};
    public onMessage(message) {};
    public clear() {};
}