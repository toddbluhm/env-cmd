"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spawn = require("cross-spawn");
var signal_termination_1 = require("./signal-termination");
var parse_args_1 = require("./parse-args");
/**
 * The main process for reading, parsing, applying and then running the process with env vars
 */
function EnvCmd(args) {
    // First Parse the args from the command line
    var parsedArgs = parse_args_1.parseArgs(args);
    var env;
    // Override the merge order if --no-override flag set
    if (parsedArgs.options.noOverride) {
        env = Object.assign({}, parsedArgs.envValues, process.env);
    }
    else {
        // Add in the system environment variables to our environment list
        env = Object.assign({}, process.env, parsedArgs.envValues);
    }
    // Execute the command with the given environment variables
    var proc = spawn(parsedArgs.command, parsedArgs.commandArgs, {
        stdio: 'inherit',
        env: env
    });
    // Handle any termination signals for parent and child proceses
    signal_termination_1.handleTermSignals(proc);
    return env;
}
module.exports = {
    EnvCmd: EnvCmd
};
