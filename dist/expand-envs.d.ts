import type { Environment } from './types.ts';
/**
 * expandEnvs Replaces $var and ${var} in args and command with environment variables
 * if the environment variable doesn't exist, it leaves it as is.
*/
export declare function expandEnvs(str: string, envs: Environment): string;
