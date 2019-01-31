"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var os = require("os");
/**
 * A simple function for resolving the path the user entered
 */
function resolveEnvFilePath(userPath) {
    // Make sure a home directory exist
    var home = os.homedir();
    if (home) {
        userPath = userPath.replace(/^~($|\/|\\)/, home + "$1");
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
