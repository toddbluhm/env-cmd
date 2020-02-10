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
        return getRCFile({
            environments: options.rc.environments,
            filePath: options.rc.filePath,
            verbose: options.verbose
        });
    }
    return getEnvFile({
        filePath: options.envFile.filePath,
        fallback: options.envFile.fallback,
        verbose: options.verbose
    });
}
exports.getEnvVars = getEnvVars;
async function getEnvFile({ filePath, fallback, verbose }) {
    // Use env file
    if (filePath !== undefined) {
        try {
            const env = await parse_env_file_1.getEnvFileVars(filePath);
            if (verbose === true) {
                console.info(`Found .env file at path: ${filePath}`);
            }
            return env;
        }
        catch (e) {
            if (verbose === true) {
                console.info(`Failed to find .env file at path: ${filePath}`);
            }
        }
        if (fallback !== true) {
            throw new Error(`Failed to find .env file at path: ${filePath}`);
        }
    }
    // Use the default env file locations
    for (const path of ENV_FILE_DEFAULT_LOCATIONS) {
        try {
            const env = await parse_env_file_1.getEnvFileVars(path);
            if (verbose === true) {
                console.info(`Found .env file at default path: ${path}`);
            }
            return env;
        }
        catch (e) { }
    }
    const error = `Failed to find .env file at default paths: [${ENV_FILE_DEFAULT_LOCATIONS.join(',')}]`;
    if (verbose === true) {
        console.info(error);
    }
    throw new Error(error);
}
exports.getEnvFile = getEnvFile;
async function getRCFile({ environments, filePath, verbose }) {
    // User provided an .rc file path
    if (filePath !== undefined) {
        try {
            const env = await parse_rc_file_1.getRCFileVars({ environments, filePath });
            if (verbose === true) {
                console.info(`Found environments: [${environments.join(',')}] for .rc file at path: ${filePath}`);
            }
            return env;
        }
        catch (e) {
            if (e.name === 'PathError') {
                if (verbose === true) {
                    console.info(`Failed to find .rc file at path: ${filePath}`);
                }
            }
            if (e.name === 'EnvironmentError') {
                if (verbose === true) {
                    console.info(`Failed to find environments: [${environments.join(',')}] for .rc file at path: ${filePath}`);
                }
            }
            throw e;
        }
    }
    // Use the default .rc file locations
    for (const path of RC_FILE_DEFAULT_LOCATIONS) {
        try {
            const env = await parse_rc_file_1.getRCFileVars({ environments, filePath: path });
            if (verbose === true) {
                console.info(`Found environments: [${environments.join(',')}] for default .rc file at path: ${path}`);
            }
            return env;
        }
        catch (e) {
            if (e.name === 'EnvironmentError') {
                const errorText = `Failed to find environments: [${environments.join(',')}] for .rc file at path: ${path}`;
                if (verbose === true) {
                    console.info(errorText);
                }
                throw new Error(errorText);
            }
        }
    }
    const errorText = `Failed to find .rc file at default paths: [${RC_FILE_DEFAULT_LOCATIONS.join(',')}]`;
    if (verbose === true) {
        console.info(errorText);
    }
    throw new Error(errorText);
}
exports.getRCFile = getRCFile;
