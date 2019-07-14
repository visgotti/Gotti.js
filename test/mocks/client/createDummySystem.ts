import ClientSystem from '../../../src/core/System/ClientSystem';

class DummySystem extends ClientSystem {
    constructor(name = 'DUMMY') {
        super(name);
    }
    public onLocalMessage(message) {};
    public onServerMessage(message) {};
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public update() {};
    public onStateUpdate(pathString, pathData, change, value) {};
    public onMessage(message) {};
    public clear() {};
    public onComponentAdded(entity) {};
    public onComponentRemoved(entity) {};
    public onPeerMessage(peerId: number | string, message: any) {};
}

export function createDummyClientSystem(name) {
    return new DummySystem(name);
}