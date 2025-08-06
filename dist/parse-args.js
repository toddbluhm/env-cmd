import { Command, Option, CommanderError } from '@commander-js/extra-typings';
import { parseArgList } from './utils.js';
import packageJson from '../package.json' with { type: 'json' };
/**
* Parses the arguments passed into the cli
*/
export function parseArgs(args) {
    // Run the initial arguments through commander in order to determine
    // which value in the args array is the `command` to execute
    const program = parseArgsUsingCommander(args);
    const command = program.args[0];
    // Grab all arguments after the `command` in the args array
    const commandArgs = args.splice(args.indexOf(command) + 1);
    // Reprocess the args with the command and command arguments removed
    // program = parseArgsUsingCommander(args.slice(0, args.indexOf(command)))
    const parsedCmdOptions = program.opts();
    // Set values for provided options
    let noOverride = false;
    // In commander `no-` negates the original value `override`
    if (parsedCmdOptions.override === false) {
        noOverride = true;
    }
    let useShell = false;
    if (parsedCmdOptions.useShell === true) {
        useShell = true;
    }
    let expandEnvs = false;
    if (parsedCmdOptions.expandEnvs === true) {
        expandEnvs = true;
    }
    let recursive = false;
    if (parsedCmdOptions.recursive === true) {
        recursive = true;
    }
    let verbose = false;
    if (parsedCmdOptions.verbose === true) {
        verbose = true;
    }
    let silent = false;
    if (parsedCmdOptions.silent === true) {
        silent = true;
    }
    let rc;
    if (parsedCmdOptions.environments !== undefined
        && Array.isArray(parsedCmdOptions.environments)
        && parsedCmdOptions.environments.length !== 0) {
        rc = {
            environments: parsedCmdOptions.environments,
            // if we get a boolean value assume not defined
            filePath: parsedCmdOptions.file === true ?
                undefined :
                parsedCmdOptions.file,
        };
    }
    let envFile;
    if (parsedCmdOptions.file !== undefined) {
        envFile = {
            // if we get a boolean value assume not defined
            filePath: parsedCmdOptions.file === true ?
                undefined :
                parsedCmdOptions.file,
            fallback: parsedCmdOptions.fallback,
        };
    }
    const options = {
        command,
        commandArgs,
        envFile,
        rc,
        options: {
            expandEnvs,
            recursive,
            noOverride,
            silent,
            useShell,
            verbose,
        },
    };
    if (verbose) {
        console.info(`Options: ${JSON.stringify(options, null, 0)}`);
    }
    return options;
}
export function parseArgsUsingCommander(args) {
    return new Command('env-cmd')
        .description('CLI for executing commands using an environment from an env file.')
        .version(packageJson.version, '-v, --version')
        .usage('[options] -- <command> [...args]')
        .option('-e, --environments [envs...]', 'The rc file environment(s) to use', parseArgList)
        .option('-f, --file [path]', 'Custom env file path or .rc file path if \'-e\' used (default path: ./.env or ./.env-cmdrc.(js|cjs|mjs|json))')
        .option('-x, --expand-envs', 'Replace $var and ${var} in args and command with environment variables')
        .option('--recursive', 'Replace $var and ${var} in env file with the referenced environment variable')
        .option('--fallback', 'Fallback to default env file path, if custom env file path not found')
        .option('--no-override', 'Do not override existing environment variables')
        .option('--silent', 'Ignore any env-cmd errors and only fail on executed program failure.')
        .option('--use-shell', 'Execute the command in a new shell with the given environment')
        .option('--verbose', 'Print helpful debugging information')
        // TODO: Remove -r deprecation error on version >= v12
        .addOption(new Option('-r, --rc-file [path]', 'Deprecated Option')
        .hideHelp()
        .argParser(() => { throw new CommanderError(1, 'deprecated-option', 'The -r flag has been deprecated, use the -f flag instead.'); }))
        .allowUnknownOption(true)
        .allowExcessArguments(true)
        .parse(['_', '_', ...args], { from: 'node' });
}
