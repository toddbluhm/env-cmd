import { getRCFileVars } from './parse-rc-file.js';
import { getEnvFileVars } from './parse-env-file.js';
import { isLoaderError } from './utils.js';
const RC_FILE_DEFAULT_LOCATIONS = ['./.env-cmdrc', './.env-cmdrc.js', './.env-cmdrc.json'];
const ENV_FILE_DEFAULT_LOCATIONS = ['./.env', './.env.js', './.env.json'];
export async function getEnvVars(options = {}) {
    options.envFile = options.envFile ?? {};
    // Check for rc file usage
    if (options.rc !== undefined) {
        return await getRCFile({
            environments: options.rc.environments,
            filePath: options.rc.filePath,
            verbose: options.verbose,
        });
    }
    return await getEnvFile({
        filePath: options.envFile.filePath,
        fallback: options.envFile.fallback,
        verbose: options.verbose,
    });
}
export async function getEnvFile({ filePath, fallback, verbose }) {
    // Use env file
    if (filePath !== undefined) {
        try {
            const env = await getEnvFileVars(filePath);
            if (verbose === true) {
                console.info(`Found .env file at path: ${filePath}`);
            }
            return env;
        }
        catch (error) {
            if (isLoaderError(error)) {
                throw error;
            }
            if (verbose === true) {
                console.info(`Failed to find .env file at path: ${filePath}`);
            }
            // Ignore error as we are just trying this location
        }
        if (fallback !== true) {
            throw new Error(`Failed to find .env file at path: ${filePath}`);
        }
    }
    // Use the default env file locations
    for (const path of ENV_FILE_DEFAULT_LOCATIONS) {
        try {
            const env = await getEnvFileVars(path);
            if (verbose === true) {
                console.info(`Found .env file at default path: ${path}`);
            }
            return env;
        }
        catch {
            // Ignore error because we are just trying this location
        }
    }
    const error = `Failed to find .env file at default paths: [${ENV_FILE_DEFAULT_LOCATIONS.join(',')}]`;
    if (verbose === true) {
        console.info(error);
    }
    throw new Error(error);
}
export async function getRCFile({ environments, filePath, verbose }) {
    // User provided an .rc file path
    if (filePath !== undefined) {
        try {
            const env = await getRCFileVars({ environments, filePath });
            if (verbose === true) {
                console.info(`Found environments: [${environments.join(',')}] for .rc file at path: ${filePath}`);
            }
            return env;
        }
        catch (e) {
            if (e instanceof Error) {
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
            }
            throw e;
        }
    }
    // Use the default .rc file locations
    for (const path of RC_FILE_DEFAULT_LOCATIONS) {
        try {
            const env = await getRCFileVars({ environments, filePath: path });
            if (verbose === true) {
                console.info(`Found environments: [${environments.join(',')}] for default .rc file at path: ${path}`);
            }
            return env;
        }
        catch (e) {
            if (e instanceof Error) {
                if (e.name === 'EnvironmentError') {
                    const errorText = `Failed to find environments: [${environments.join(',')}] for .rc file at path: ${path}`;
                    if (verbose === true) {
                        console.info(errorText);
                    }
                    throw new Error(errorText);
                }
                if (e.name === 'ParseError') {
                    if (verbose === true) {
                        console.info(e.message);
                    }
                    throw new Error(e.message);
                }
            }
        }
    }
    const errorText = `Failed to find .rc file at default paths: [${RC_FILE_DEFAULT_LOCATIONS.join(',')}]`;
    if (verbose === true) {
        console.info(errorText);
    }
    throw new Error(errorText);
}
