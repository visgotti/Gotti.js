declare class Decorators {
    constructor();
    initializeSystemComponentDecorator(systems: any): void;
    SystemComponent(systemName: string | number): void;
    restore(): void;
}
declare const decorators: Decorators;
export { decorators };
