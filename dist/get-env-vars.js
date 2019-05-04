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
const parse_rc_file_1 = require("./parse-rc-file");
const parse_env_file_1 = require("./parse-env-file");
const RC_FILE_DEFAULT_LOCATIONS = ['./.env-cmdrc', './.env-cmdrc.js', './.env-cmdrc.json'];
const ENV_FILE_DEFAULT_LOCATION = './.env';
function getEnvVars(options) {
    return __awaiter(this, void 0, void 0, function* () {
        options = options || {};
        options.envFile = options.envFile || {};
        // Check for rc file usage
        if (options.rc) {
            return getRCFile({ environments: options.rc.environments, filePath: options.rc.filePath });
        }
        return getEnvFile({ filePath: options.envFile.filePath, fallback: options.envFile.fallback });
    });
}
exports.getEnvVars = getEnvVars;
function getEnvFile({ filePath, fallback }) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use env file
        if (filePath) {
            try {
                return yield parse_env_file_1.getEnvFileVars(filePath);
            }
            catch (e) { }
            if (!fallback) {
                throw new Error(`Unable to locate env file at location (${filePath})`);
            }
        }
        // Use the default env file location
        try {
            return yield parse_env_file_1.getEnvFileVars(ENV_FILE_DEFAULT_LOCATION);
        }
        catch (e) {
            throw new Error(`Unable to locate env file at default location (${ENV_FILE_DEFAULT_LOCATION})`);
        }
    });
}
exports.getEnvFile = getEnvFile;
function getRCFile({ environments, filePath }) {
    return __awaiter(this, void 0, void 0, function* () {
        // User provided an .rc file path
        if (filePath) {
            try {
                return parse_rc_file_1.getRCFileVars({ environments, filePath });
            }
            catch (e) {
                throw new Error(`Unable to locate .rc file at location (${filePath})`);
            }
        }
        // Use the default .rc file locations
        for (const path of RC_FILE_DEFAULT_LOCATIONS) {
            try {
                return parse_rc_file_1.getRCFileVars({ environments, filePath: path });
            }
            catch (e) { }
        }
        throw new Error(`Unable to locate .rc file at default locations (${RC_FILE_DEFAULT_LOCATIONS})`);
    });
}
exports.getRCFile = getRCFile;
