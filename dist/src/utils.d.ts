/**
 * A simple function for resolving the path the user entered
 */
export declare function resolveEnvFilePath(userPath: string): string;
/**
 * A simple function that parses a comma separated string into an array of strings
 */
export declare function parseArgList(list: string): string[];
/**
 * A simple function to test if the value is a promise
 */
export declare function isPromise(value: any | PromiseLike<Object>): value is Promise<any>;
