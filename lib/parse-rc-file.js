"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var utils_1 = require("./utils");
/**
 * Uses the rc file and rc environment to get env vars
 */
function useRCFile(_a) {
    var environments = _a.environments, path = _a.path;
    var absolutePath = utils_1.resolveEnvFilePath(path);
    console.log(absolutePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error('Invalid .rc file path.');
    }
    var fileData = fs.readFileSync(absolutePath, { encoding: 'utf8' });
    var parsedData = parseRCFile(fileData);
    if (environments.length === 1 && !parsedData[environments[0]]) {
        console.error("Error:\n  Could not find environment:\n    " + environments[0] + "\n  in .rc file:\n    " + absolutePath);
        throw new Error("Missing environment " + environments[0] + " in .env-cmdrc file.");
    }
    // Parse and merge multiple rc environments together
    var result = {};
    var environmentFound = false;
    environments.forEach(function (name) {
        var envVars = parsedData[name];
        if (envVars) {
            environmentFound = true;
            result = __assign({}, result, envVars);
        }
    });
    if (!environmentFound) {
        console.error("Error:\n  Could not find any environments:\n    " + environments + "\n  in .rc file:\n    " + absolutePath);
        throw new Error("All environments (" + environments + ") are missing in in .rc file (" + absolutePath + ").");
    }
    return result;
}
exports.useRCFile = useRCFile;
/**
 * Reads and parses the .env-cmdrc file
 */
function parseRCFile(fileData) {
    var data;
    try {
        data = JSON.parse(fileData);
    }
    catch (e) {
        console.error("Error:\n  Could not parse the .env-cmdrc file.\n  Please make sure its in a valid JSON format.");
        throw new Error("Unable to parse JSON in .env-cmdrc file.");
    }
    return data;
}
exports.parseRCFile = parseRCFile;
