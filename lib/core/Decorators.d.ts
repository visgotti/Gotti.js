import System from './System/System';
/**
 * Returns a function that will map the systems onComponentAdded and onComponentRemoved functions to a component
 * to be triggered when its added or removed from an entity.
 * @param systems
 */
declare type SystemComponentDecorator = (systemName: string) => any;
declare class Decorators {
    constructor();
    initializeSystemComponentDecorator(systems: any): void;
    SystemComponent: SystemComponentDecorator;
}
declare const decorators: Decorators;
export { decorators };
export declare const initializeSystemComponentDecorator: (systems: {
    [systemName: string]: System;
}) => void;
