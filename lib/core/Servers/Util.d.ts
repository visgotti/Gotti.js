export declare function registerGracefulShutdown(callback: any): void;
export declare function retry(cb: Function, maxRetries?: number, retries?: number, errorWhiteList?: any[]): Promise<{}>;
export declare function spliceOne(arr: any[], index: number): boolean;
export declare function parseQueryString(query: string): any;
export declare function generateId(): any;
export declare function merge(a: any, ...objs: any[]): any;
export declare function sortByProperty(property: any): (a: any, b: any) => 0 | 1 | -1;
export declare function logError(err: Error): void;
