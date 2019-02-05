import { ClientProcess } from '../../../src/core/Process/Client';

import { createDummyWebClient } from './createDummyWebClient';

export function createDummyClientProcess(globalVariables?: any) {
    return new ClientProcess(createDummyWebClient(), globalVariables);
}