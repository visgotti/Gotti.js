import ClientSystem from './ClientSystem';
import ServerSystem from './ServerSystem';
import { ServerProcess } from '../Process/Server';
import { ClientProcess } from '../Process/Client';
export declare const server: (process: ServerProcess) => (system: ServerSystem) => void;
export declare const client: (process: ClientProcess) => (system: ClientSystem) => void;
