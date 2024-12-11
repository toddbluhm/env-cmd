import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { cwd } from 'node:process';
// Special file extensions that node can natively import
export const IMPORT_HOOK_EXTENSIONS = ['.json', '.js', '.cjs', '.mjs'];
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
// "Import Attributes" are only supported since node v18.20 and v20.10.
// For older node versions, we have to use "Import Assertions".
// TODO: remove this check when we drop support for node v20
const [major, minor] = process.version.slice(1).split('.').map(Number);
const legacyImportAssertions = (major === 18 && minor < 20) || (major === 20 && minor < 10);
export const importAttributesKeyword = legacyImportAssertions ? 'assert' : 'with';
