"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function getRCFileVars({ environments, filePath }) {
    return __awaiter(this, void 0, void 0, function* () {
        const absolutePath = utils_1.resolveEnvFilePath(filePath);
        try {
            yield statAsync(absolutePath);
        }
        catch (e) {
            throw new Error('Invalid .rc file path.');
        }
        // Get the file extension
        const ext = path_1.extname(absolutePath).toLowerCase();
        let parsedData;
        if (ext === '.json' || ext === '.js') {
            const possiblePromise = require(absolutePath); /* eslint-disable-line */
            parsedData = utils_1.isPromise(possiblePromise) ? yield possiblePromise : possiblePromise;
        }
        else {
            const file = yield readFileAsync(absolutePath, { encoding: 'utf8' });
            parsedData = parseRCFile(file);
        }
        // Parse and merge multiple rc environments together
        let result = {};
        let environmentFound = false;
        environments.forEach((name) => {
            const envVars = parsedData[name];
            if (envVars) {
                environmentFound = true;
                result = Object.assign({}, result, envVars);
            }
        });
        if (!environmentFound) {
            console.error(`Error:
  Could not find any environments:
    ${environments}
  in .rc file:
    ${absolutePath}`);
            throw new Error(`All environments (${environments}) are missing in in .rc file (${absolutePath}).`);
        }
        return result;
    });
}
exports.getRCFileVars = getRCFileVars;
/**
 * Reads and parses the .rc file
 */
function parseRCFile(fileData) {
    let data;
    try {
        data = JSON.parse(fileData);
    }
    catch (e) {
        console.error(`Error:
  Failed to parse the .rc file.
  Please make sure its a valid JSON format.`);
        throw new Error(`Unable to parse JSON in .rc file.`);
    }
    return data;
}
exports.parseRCFile = parseRCFile;
