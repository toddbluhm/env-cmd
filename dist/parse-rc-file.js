"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = require("path");
const utils_1 = require("./utils");
const statAsync = util_1.promisify(fs_1.stat);
const readFileAsync = util_1.promisify(fs_1.readFile);
/**
 * Gets the env vars from the rc file and rc environments
 */
async function getRCFileVars({ environments, filePath }) {
    const absolutePath = utils_1.resolveEnvFilePath(filePath);
    try {
        await statAsync(absolutePath);
    }
    catch (e) {
        const pathError = new Error(`Failed to find .rc file at path: ${absolutePath}`);
        pathError.name = 'PathError';
        throw pathError;
    }
    // Get the file extension
    const ext = path_1.extname(absolutePath).toLowerCase();
    let parsedData;
    try {
        if (ext === '.json' || ext === '.js') {
            const possiblePromise = require(absolutePath); /* eslint-disable-line */
            parsedData = utils_1.isPromise(possiblePromise) ? await possiblePromise : possiblePromise;
        }
        else {
            const file = await readFileAsync(absolutePath, { encoding: 'utf8' });
            parsedData = JSON.parse(file);
        }
    }
    catch (e) {
        const parseError = new Error(`Failed to parse .rc file at path: ${absolutePath}`);
        parseError.name = 'ParseError';
        throw parseError;
    }
    // Parse and merge multiple rc environments together
    let result = {};
    let environmentFound = false;
    environments.forEach((name) => {
        const envVars = parsedData[name];
        if (envVars !== undefined) {
            environmentFound = true;
            result = Object.assign(Object.assign({}, result), envVars);
        }
    });
    if (!environmentFound) {
        const environmentError = new Error(`Failed to find environments [${environments.join(',')}] at .rc file location: ${absolutePath}`);
        environmentError.name = 'EnvironmentError';
        throw environmentError;
    }
    return result;
}
exports.getRCFileVars = getRCFileVars;
