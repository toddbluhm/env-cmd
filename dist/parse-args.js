"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const utils_1 = require("./utils");
// Use commonjs require to prevent a weird folder hierarchy in dist
const packageJson = require('../package.json'); /* eslint-disable-line */
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
    const expandEnvs = !!program.expandEnvs;
    const verbose = !!program.verbose;
    const silent = !!program.silent;
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
    const options = {
        command,
        commandArgs,
        envFile,
        rc,
        options: {
            expandEnvs,
            noOverride,
            silent,
            useShell,
            verbose
        }
    };
    if (verbose === true) {
        console.info(`Options: ${JSON.stringify(options, null, 0)}`);
    }
    return options;
}
exports.parseArgs = parseArgs;
function parseArgsUsingCommander(args) {
    const program = new commander_1.Command();
    return program
        .version(packageJson.version, '-v, --version')
        .usage('[options] <command> [...args]')
        .option('-e, --environments [env1,env2,...]', 'The rc file environment(s) to use', utils_1.parseArgList)
        .option('-f, --file [path]', 'Custom env file path (default path: ./.env)')
        .option('--fallback', 'Fallback to default env file path, if custom env file path not found')
        .option('--no-override', 'Do not override existing environment variables')
        .option('-r, --rc-file [path]', 'Custom rc file path (default path: ./.env-cmdrc(|.js|.json)')
        .option('--silent', 'Ignore any env-cmd errors and only fail on executed program failure.')
        .option('--use-shell', 'Execute the command in a new shell with the given environment')
        .option('--verbose', 'Print helpful debugging information')
        .option('-x, --expand-envs', 'Replace $var in args and command with environment variables')
        .parse(['_', '_', ...args]);
}
exports.parseArgsUsingCommander = parseArgsUsingCommander;
