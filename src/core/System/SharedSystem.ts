import System from "./System";

/**
 * Shared system is an isolated system from remote communications.
 * If you need a system that runs independently from needed server functionality
 * and is meant to be ran on both server and client, then this can accomplish that
 * while also dispatching local messages.
 */
export abstract class SharedSystem extends System {
    readonly name: string;

    private dispatch = Function;

    constructor(name: string) {
        super(name);
        this.dispatch = this.dispatchLocal.bind(this);
        this.onMessage = this.onRemoteMessage.bind(this);
    }

    public abstract onMessage(message);
    //TODO: would be cool to do a runtime code check to make sure onStateUpdate implements all listeners
    public onStateUpdate(path, change, value) {};
}