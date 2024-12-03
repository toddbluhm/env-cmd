import type { EnvCmdOptions, Environment } from './types.ts';
/**
 * The main env-cmd program. This will spawn a new process and run the given command using
 * various environment file solutions.
 *
 * @export
 * @param {EnvCmdOptions} { command, commandArgs, envFile, rc, options }
 * @returns {Promise<Environment>} Returns an object containing [environment variable name]: value
 */
export declare function EnvCmd({ command, commandArgs, envFile, rc, options, }: EnvCmdOptions): Promise<Environment>;
