"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = exports.parseArgList = exports.resolveEnvFilePath = void 0;
const path = require("path");
const os = require("os");
/**
 * A simple function for resolving the path the user entered
 */
function resolveEnvFilePath(userPath) {
    // Make sure a home directory exist
    const home = os.homedir();
    if (home !== undefined) {
        userPath = userPath.replace(/^~($|\/|\\)/, `${home}$1`);
    }
    return path.resolve(process.cwd(), userPath);
}
exports.resolveEnvFilePath = resolveEnvFilePath;
/**
 * A simple function that parses a comma separated string into an array of strings
 */
function parseArgList(list) {
    return list.split(',');
}
exports.parseArgList = parseArgList;
/**
 * A simple function to test if the value is a promise
 */
function isPromise(value) {
    return value != null && typeof value.then === 'function';
}
exports.isPromise = isPromise;
