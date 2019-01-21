declare enum NAMES {
    POSITION_SYSTEM = 0
}
declare class test {
    constructor();
    onServerMessage(): void;
    onClientMessage(): void;
    registerClientMessages(): void;
    registerServerMessages(): void;
}
