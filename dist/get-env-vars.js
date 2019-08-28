"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_rc_file_1 = require("./parse-rc-file");
const parse_env_file_1 = require("./parse-env-file");
const RC_FILE_DEFAULT_LOCATIONS = ['./.env-cmdrc', './.env-cmdrc.js', './.env-cmdrc.json'];
const ENV_FILE_DEFAULT_LOCATIONS = ['./.env', './.env.js', './.env.json'];
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
        // Use the default env file locations
        for (const path of ENV_FILE_DEFAULT_LOCATIONS) {
            try {
                return yield parse_env_file_1.getEnvFileVars(path);
            }
            catch (e) { }
        }
        throw new Error(`Unable to locate env file at default locations (${ENV_FILE_DEFAULT_LOCATIONS})`);
    });
}
exports.getEnvFile = getEnvFile;
async function getRCFile({ environments, filePath }) {
    // User provided an .rc file path
    if (filePath) {
        try {
            return await parse_rc_file_1.getRCFileVars({ environments, filePath });
        }
        catch (e) {
            if (e.name !== 'PathError')
                console.log(e);
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
                console.log(e);
        }
    }
    throw new Error(`Unable to locate .rc file at default locations (${RC_FILE_DEFAULT_LOCATIONS})`);
}
exports.getRCFile = getRCFile;
