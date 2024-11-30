/**
 * Gets the environment vars from an env file
 */
export declare function getEnvFileVars(envFilePath: string): Promise<Record<string, any>>;
/**
 * Parse out all env vars from a given env file string and return an object
 */
export declare function parseEnvString(envFileString: string): Record<string, string>;
/**
 * Parse out all env vars from an env file string
 */
export declare function parseEnvVars(envString: string): Record<string, string>;
/**
 * Strips out comments from env file string
 */
export declare function stripComments(envString: string): string;
/**
 * Strips out newlines from env file string
 */
export declare function stripEmptyLines(envString: string): string;
