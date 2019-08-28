"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const utils_1 = require("./utils");
/**
* Parses the arguments passed into the cli
*/
function parseArgs(args) {
    // Get the command and command args
    let program = parseArgsUsingCommander(args);
    const command = program.args[0];
    const commandArgs = args.splice(args.indexOf(command) + 1);
    // Reprocess the args with the command and command args removed
    program = parseArgsUsingCommander(args.slice(0, args.indexOf(command)));
    const noOverride = !program.override;
    const useShell = !!program.useShell;
    let rc;
    if (program.environments !== undefined && program.environments.length !== 0) {
        rc = {
            environments: program.environments,
            filePath: program.rcFile
        };
    }
    let envFile;
    if (program.file !== undefined) {
        envFile = {
            filePath: program.file,
            fallback: program.fallback
        };
    }
    return {
        command,
        commandArgs,
        envFile,
        rc,
        options: {
            noOverride,
            useShell
        }
    };
}
exports.parseArgs = parseArgs;
function parseArgsUsingCommander(args) {
    const program = new commander_1.Command();
    return program
        .version('9.0.1', '-v, --version')
        .usage('[options] <command> [...args]')
        .option('-f, --file [path]', 'Custom env file path (default path: ./.env)')
        .option('-r, --rc-file [path]', 'Custom rc file path (default path: ./.env-cmdrc(|.js|.json)')
        .option('-e, --environments [env1,env2,...]', 'The rc file environment(s) to use', utils_1.parseArgList)
        .option('--fallback', 'Fallback to default env file path, if custom env file path not found')
        .option('--no-override', 'Do not override existing environment variables')
        .option('--use-shell', 'Execute the command in a new shell with the given environment')
        .parse(['_', '_', ...args]);
}
exports.parseArgsUsingCommander = parseArgsUsingCommander;
