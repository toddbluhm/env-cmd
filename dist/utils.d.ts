export declare const IMPORT_HOOK_EXTENSIONS: string[];
/**
 * A simple function for resolving the path the user entered
 */
export declare function resolveEnvFilePath(userPath: string): string;
/**
 * A simple function that parses a comma separated string into an array of strings
 */
export declare function parseArgList(list: string): string[];
/**
 * A simple function to test if the value is a promise/thenable
 */
export declare function isPromise<T>(value?: T | PromiseLike<T>): value is PromiseLike<T>;
/** @returns true if the error is `ERR_UNKNOWN_FILE_EXTENSION` */
export declare function isLoaderError(error: unknown): error is Error;
