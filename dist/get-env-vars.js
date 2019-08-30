"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_rc_file_1 = require("./parse-rc-file");
const parse_env_file_1 = require("./parse-env-file");
const RC_FILE_DEFAULT_LOCATIONS = ['./.env-cmdrc', './.env-cmdrc.js', './.env-cmdrc.json'];
const ENV_FILE_DEFAULT_LOCATIONS = ['./.env', './.env.js', './.env.json'];
async function getEnvVars(options = {}) {
    options.envFile = options.envFile !== undefined ? options.envFile : {};
    // Check for rc file usage
    if (options.rc !== undefined) {
        return getRCFile({ environments: options.rc.environments, filePath: options.rc.filePath });
    }
    return getEnvFile({ filePath: options.envFile.filePath, fallback: options.envFile.fallback });
}
exports.getEnvVars = getEnvVars;
async function getEnvFile({ filePath, fallback }) {
    // Use env file
    if (filePath !== undefined) {
        try {
            return await parse_env_file_1.getEnvFileVars(filePath);
        }
        catch (e) { }
        if (fallback !== true) {
            throw new Error(`Unable to locate env file at location (${filePath})`);
        }
    }
    // Use the default env file locations
    for (const path of ENV_FILE_DEFAULT_LOCATIONS) {
        try {
            return await parse_env_file_1.getEnvFileVars(path);
        }
        catch (e) { }
    }
    throw new Error(`Unable to locate env file at default locations (${ENV_FILE_DEFAULT_LOCATIONS})`);
}
exports.getEnvFile = getEnvFile;
async function getRCFile({ environments, filePath }) {
    // User provided an .rc file path
    if (filePath !== undefined) {
        try {
            return await parse_rc_file_1.getRCFileVars({ environments, filePath });
        }
        catch (e) {
            if (e.name !== 'PathError')
                console.error(e);
            throw new Error(`Unable to locate .rc file at location (${filePath})`);
        }
    }
    // Use the default .rc file locations
    for (const filePath of RC_FILE_DEFAULT_LOCATIONS) {
        try {
            return await parse_rc_file_1.getRCFileVars({ environments, filePath });
        }
        catch (e) {
            if (e.name !== 'PathError')
                console.error(e);
        }
    }
    throw new Error(`Unable to locate .rc file at default locations (${RC_FILE_DEFAULT_LOCATIONS})`);
}
exports.getRCFile = getRCFile;
