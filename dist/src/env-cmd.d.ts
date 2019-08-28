import { EnvCmdOptions } from './types';
/**
 * Executes env - cmd using command line arguments
 * @export
 * @param {string[]} args Command line argument to pass in ['-f', './.env']
 * @returns {Promise<{ [key: string]: any }>}
 */
export declare function CLI(args: string[]): Promise<{
    [key: string]: any;
}>;
/**
 * The main env-cmd program. This will spawn a new process and run the given command using
 * various environment file solutions.
 *
 * @export
 * @param {EnvCmdOptions} { command, commandArgs, envFile, rc, options }
 * @returns {Promise<{ [key: string]: any }>} Returns an object containing [environment variable name]: value
 */
export declare function EnvCmd({ command, commandArgs, envFile, rc, options }: EnvCmdOptions): Promise<{
    [key: string]: any;
}>;
