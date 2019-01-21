import System from "./System";
/**
 * Shared system is an isolated system from remote communications.
 * If you need a system that runs independently from needed server functionality
 * and is meant to be ran on both server and client, then this can accomplish that
 * while also dispatching local messages.
 */
export declare abstract class SharedSystem extends System {
    readonly name: string;
    private dispatch;
    constructor(name: string);
    abstract onMessage(message: any): void;
    onStateUpdate(path: any, change: any, value: any): void;
}
