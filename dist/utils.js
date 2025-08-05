import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { cwd } from 'node:process';
// Special file extensions that node can natively import
export const IMPORT_HOOK_EXTENSIONS = [
    '.json',
    '.js',
    '.cjs',
    '.mjs',
    '.ts',
    '.mts',
    '.cts',
    '.tsx',
];
/**
 * A simple function for resolving the path the user entered
 */
export function resolveEnvFilePath(userPath) {
    // Make sure a home directory exist
    const home = homedir();
    if (home != null) {
        userPath = userPath.replace(/^~($|\/|\\)/, `${home}$1`);
    }
    return resolve(cwd(), userPath);
}
/**
 * A simple function that parses a comma separated string into an array of strings
 */
export function parseArgList(list) {
    return list.split(',');
}
/**
 * A simple function to test if the value is a promise/thenable
 */
export function isPromise(value) {
    return value != null
        && typeof value === 'object'
        && 'then' in value
        && typeof value.then === 'function';
}
/** @returns true if the error is `ERR_UNKNOWN_FILE_EXTENSION` */
export function isLoaderError(error) {
    return (error instanceof Error &&
        'code' in error &&
        error.code === 'ERR_UNKNOWN_FILE_EXTENSION');
}
