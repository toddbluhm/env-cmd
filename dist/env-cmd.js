import { default as spawn } from 'cross-spawn';
import { TermSignals } from './signal-termination.js';
import { getEnvVars } from './get-env-vars.js';
import { expandEnvs } from './expand-envs.js';
import * as processLib from 'node:process';
/**
 * The main env-cmd program. This will spawn a new process and run the given command using
 * various environment file solutions.
 *
 * @export
 * @param {EnvCmdOptions} { command, commandArgs, envFile, rc, options }
 * @returns {Promise<Environment>} Returns an object containing [environment variable name]: value
 */
export async function EnvCmd({ command, commandArgs, envFile, rc, options = {}, }) {
    let env = {};
    try {
        env = await getEnvVars({ envFile, rc, verbose: options.verbose });
    }
    catch (e) {
        if (!(options.silent ?? false)) {
            throw e;
        }
    }
    // Override the merge order if --no-override flag set
    if (options.noOverride === true) {
        env = Object.assign({}, env, processLib.env);
    }
    else {
        // Add in the system environment variables to our environment list
        env = Object.assign({}, processLib.env, env);
    }
    if (options.recursive === true) {
        for (const key of Object.keys(env)) {
            if (env[key] !== undefined) {
                env[key] = expandEnvs(env[key], env);
            }
        }
    }
    if (options.expandEnvs === true) {
        command = expandEnvs(command, env);
        commandArgs = commandArgs.map(arg => expandEnvs(arg, env));
    }
    if (!command) {
        throw new Error('env-cmd cannot be used as a standalone command. ' +
            'Refer to the documentation for usage examples: https://npm.im/env-cmd');
    }
    // Execute the command with the given environment variables
    const proc = spawn(command, commandArgs, {
        stdio: 'inherit',
        shell: options.useShell,
        env,
    });
    // Handle any termination signals for parent and child proceses
    const signals = new TermSignals({ verbose: options.verbose });
    signals.handleUncaughtExceptions();
    signals.handleTermSignals(proc);
    return env;
}
