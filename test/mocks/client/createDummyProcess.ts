import { ClientProcess } from '../../../src/core/Process/Client';

import { createDummyWebClient } from './createDummyWebClient';

export function createDummyNetworkClientProcess(globalVariables?: any) {
    return new ClientProcess(createDummyWebClient(), true, globalVariables);
}

export function createDummyOfflineClientProcess(globalVariables?: any) {
    return new ClientProcess(createDummyWebClient(), false, globalVariables);
}