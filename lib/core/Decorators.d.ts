declare class Decorators {
    constructor();
    initializeSystemComponentDecorator(systems: any): void;
    SystemComponent(systemName: string | number): any;
    restore(): void;
}
declare const decorators: Decorators;
export { decorators };
