import ClientSystem from '../../../src/core/System/ClientSystem';

class DummySystem extends ClientSystem {
    constructor() {
        super('DUMMY');
    }
    public onLocalMessage(message) {};
    public onServerMessage(message) {};
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public update() {};
    public onMessage(message) {};
    public clear() {};
}

export function createDummyClientSystem(name) {
    return new DummySystem(name);
}