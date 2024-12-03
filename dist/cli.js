import * as processLib from 'node:process';
import { EnvCmd } from './env-cmd.js';
import { parseArgs } from './parse-args.js';
/**
 * Executes env - cmd using command line arguments
 * @export
 * @param {string[]} args Command line argument to pass in ['-f', './.env']
 * @returns {Promise<Environment>}
 */
export async function CLI(args) {
    // Parse the args from the command line
    const parsedArgs = parseArgs(args);
    // Run EnvCmd
    try {
        return await EnvCmd(parsedArgs);
    }
    catch (e) {
        console.error(e);
        return processLib.exit(1);
    }
}
