import System from "./System";
import { Message } from '../MessageQueue';
declare abstract class ClientSystem extends System {
    readonly name: string | number;
    private client;
    protected dispatchToServer: (message: Message) => void;
    constructor(name: string | number);
    /**
     * Initialize gets called by the process and
     * populates the system with the web client, message queue, and any
     * user defined variables you want all systems to have access to.
     * The web client
     * @param client - Gotti web client
     * @param messageQueue
     * @param globalSystemVariables - map of objects or values you want to be able to access in any system in the globals property.
     */
    initialize(client: any, messageQueue: any, globalSystemVariables: {
        [reference: string]: any;
    }): void;
    abstract onServerMessage(message: Message): any;
    addListenStatePaths(path: string | Array<string>): void;
    onStateUpdate(pathString: any, pathData: any, change: any, value: any): void;
}
export default ClientSystem;
