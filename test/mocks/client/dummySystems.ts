import ClientSystem from '../../../src/core/System/ClientSystem';

import { system_names } from '../';

export class DummySystem1 extends ClientSystem {
    constructor() {
        super(system_names[0]);
    }
    public onLocalMessage(message) {};
    public onServerMessage(message) {};
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public update() {};
    public onStateUpdate(pathString, pathData, change, value) {};
    public onMessage(message) {};
    public onComponentAdded(entity) {};
    public onComponentRemoved(entity) {};
    public clear() {};
}

export class DummySystem2 extends ClientSystem {
    constructor() {
        super(system_names[1]);
    }
    public onLocalMessage(message) {};
    public onServerMessage(message) {};
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public update() {};
    public onStateUpdate(pathString, pathData, change, value) {};
    public onMessage(message) {};
    public onComponentAdded(entity) {};
    public onComponentRemoved(entity) {};
    public clear() {};
}

export class DummySystem3 extends ClientSystem {
    constructor() {
        super(system_names[2]);
    }
    public onLocalMessage(message) {};
    public onServerMessage(message) {};
    public onInit() {};
    public onStop() {};
    public onStart() {};
    public update() {};
    public onStateUpdate(pathString, pathData, change, value) {};
    public onMessage(message) {};
    public onComponentAdded(entity) {};
    public onComponentRemoved(entity) {};
    public clear() {};
}