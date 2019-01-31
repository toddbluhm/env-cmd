"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var utils_1 = require("./utils");
/**
 * Uses the cli passed env file path to get env vars
 */
function useCmdLine(envFilePath) {
    var absolutePath = utils_1.resolveEnvFilePath(envFilePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error("Invalid env file path (" + envFilePath + ").");
    }
    // Get the file extension
    var ext = path.extname(absolutePath).toLowerCase();
    var env;
    if (ext === '.json') {
        env = require(absolutePath);
    }
    else {
        var file = fs.readFileSync(absolutePath, { encoding: 'utf8' });
        env = parseEnvString(file);
    }
    return env;
}
exports.useCmdLine = useCmdLine;
/**
 * Parse out all env vars from a given env file string and return an object
 */
function parseEnvString(envFileString) {
    // First thing we do is stripe out all comments
    envFileString = stripComments(envFileString.toString());
    // Next we stripe out all the empty lines
    envFileString = stripEmptyLines(envFileString);
    // Merge the file env vars with the current process env vars (the file vars overwrite process vars)
    return parseEnvVars(envFileString);
}
exports.parseEnvString = parseEnvString;
/**
 * Parse out all env vars from an env file string
 */
function parseEnvVars(envString) {
    var envParseRegex = /^((.+?)[=](.*))$/gim;
    var matches = {};
    var match;
    while ((match = envParseRegex.exec(envString)) !== null) {
        // Note: match[1] is the full env=var line
        var key = match[2].trim();
        var value = match[3].trim() || '';
        // remove any surrounding quotes
        matches[key] = value.replace(/(^['"]|['"]$)/g, '');
    }
    return matches;
}
exports.parseEnvVars = parseEnvVars;
/**
 * Strips out comments from env file string
 */
function stripComments(envString) {
    var commentsRegex = /(^#.*$)/gim;
    var match = commentsRegex.exec(envString);
    var newString = envString;
    while (match != null) {
        newString = newString.replace(match[1], '');
        match = commentsRegex.exec(envString);
    }
    return newString;
}
exports.stripComments = stripComments;
/**
 * Strips out newlines from env file string
 */
function stripEmptyLines(envString) {
    var emptyLinesRegex = /(^\n)/gim;
    return envString.replace(emptyLinesRegex, '');
}
exports.stripEmptyLines = stripEmptyLines;
