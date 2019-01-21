import System from "./System";
import { WebClient } from '../WebClient';
import { Message, MessageQueue } from '../MessageQueue';
declare abstract class ClientSystem extends System {
    readonly name: string;
    private interfaceManager?;
    private client;
    private dispatchToServer;
    constructor(name: string);
    initialize(entityMap: any, gameState: any, messageQueue: MessageQueue, client: WebClient, interfaceManager: any): void;
    abstract onServerMessage(message: Message): any;
    addListenStatePaths(path: string | Array<string>): void;
    onStateUpdate(path: any, change: any, value: any): void;
}
export default ClientSystem;
