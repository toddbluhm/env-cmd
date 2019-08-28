"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spawn_1 = require("./spawn");
const signal_termination_1 = require("./signal-termination");
const parse_args_1 = require("./parse-args");
const get_env_vars_1 = require("./get-env-vars");
/**
 * Executes env - cmd using command line arguments
 * @export
 * @param {string[]} args Command line argument to pass in ['-f', './.env']
 * @returns {Promise<{ [key: string]: any }>}
 */
async function CLI(args) {
    // Parse the args from the command line
    const parsedArgs = parse_args_1.parseArgs(args);
    // Run EnvCmd
    try {
        return await exports.EnvCmd(parsedArgs);
    }
    catch (e) {
        console.error(e);
        return process.exit(1);
    }
}
exports.CLI = CLI;
/**
 * The main env-cmd program. This will spawn a new process and run the given command using
 * various environment file solutions.
 *
 * @export
 * @param {EnvCmdOptions} { command, commandArgs, envFile, rc, options }
 * @returns {Promise<{ [key: string]: any }>} Returns an object containing [environment variable name]: value
 */
async function EnvCmd({ command, commandArgs, envFile, rc, options = {} }) {
    let env = await get_env_vars_1.getEnvVars({ envFile, rc });
    // Override the merge order if --no-override flag set
    if (options.noOverride === true) {
        env = Object.assign({}, env, process.env);
    }
    else {
        // Add in the system environment variables to our environment list
        env = Object.assign({}, process.env, env);
    }
    // Execute the command with the given environment variables
    const proc = spawn_1.spawn(command, commandArgs, {
        stdio: 'inherit',
        shell: options.useShell,
        env
    });
    // Handle any termination signals for parent and child proceses
    const signals = new signal_termination_1.TermSignals();
    signals.handleUncaughtExceptions();
    signals.handleTermSignals(proc);
    return env;
}
exports.EnvCmd = EnvCmd;
