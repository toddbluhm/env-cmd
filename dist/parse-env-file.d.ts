import type { Environment } from './types.ts';
/**
 * Gets the environment vars from an env file
 */
export declare function getEnvFileVars(envFilePath: string): Promise<Environment>;
/**
 * Parse out all env vars from a given env file string and return an object
 */
export declare function parseEnvString(envFileString: string): Environment;
/**
 * Parse out all env vars from an env file string
 */
export declare function parseEnvVars(envString: string): Environment;
/**
 * Strips out comments from env file string
 */
export declare function stripComments(envString: string): string;
/**
 * Strips out newlines from env file string
 */
export declare function stripEmptyLines(envString: string): string;
/**
 * If we load data from a file like .js, the user
 * might export something which is not an object.
 *
 * This function ensures that the input is valid,
 * and converts the object's values to strings, for
 * consistincy. See issue #125 for details.
 */
export declare function normalizeEnvObject(input: unknown, absolutePath: string): Environment;
