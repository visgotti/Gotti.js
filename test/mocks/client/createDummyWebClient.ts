import { Client as WebClient } from '../../../src/core/WebClient/Client';

export function createDummyWebClient(url?: string, token?: string) {
    return new WebClient([], url);
}