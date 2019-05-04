"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function CLI(args) {
    return __awaiter(this, void 0, void 0, function* () {
        // Parse the args from the command line
        const parsedArgs = parse_args_1.parseArgs(args);
        // Run EnvCmd
        return exports.EnvCmd(parsedArgs);
    });
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
function EnvCmd({ command, commandArgs, envFile, rc, options }) {
    return __awaiter(this, void 0, void 0, function* () {
        options = options || {};
        let env = yield get_env_vars_1.getEnvVars({ envFile, rc });
        // Override the merge order if --no-override flag set
        if (options.noOverride) {
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
    });
}
exports.EnvCmd = EnvCmd;
