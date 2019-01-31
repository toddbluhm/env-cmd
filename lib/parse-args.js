"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var utils_1 = require("./utils");
var parse_rc_file_1 = require("./parse-rc-file");
var parse_env_file_1 = require("./parse-env-file");
var RC_FILE_DEFAULT_LOCATIONS = ['./.env-cmdrc', './.env-cmdrc.json'];
var ENV_FILE_DEFAULT_LOCATION = './.env';
/**
* Parses the arguments passed into the cli
*/
function parseArgs(args) {
    program
        .version('1.0.0', '-v, --version')
        .usage('[options] <command> [...args]')
        .option('-f, --file [path]', 'Custom .env file location')
        .option('-r, --rc-file [path]', 'Custom .env-cmdrc file location')
        .option('-e, --environments [env...]', 'The rc-file environment to select', utils_1.parseArgList)
        .option('--fallback', 'Enables auto fallback to default env file location')
        .option('--no-override', 'Do not override existing env vars')
        .parse(['_', '_'].concat(args));
    // get the command and command args
    var command = program.args[0];
    var commandArgs = program.args.slice(1);
    var noOverride = !program.override;
    var returnValue = {
        command: command,
        commandArgs: commandArgs,
        options: {
            noOverride: noOverride
        }
    };
    // Check for rc file usage
    var env;
    if (program.environments) {
        // user provided an .rc file path
        if (program.rcFile) {
            try {
                env = parse_rc_file_1.useRCFile({ environments: program.environments, path: program.rcFile });
            }
            catch (e) {
                console.log(program.outputHelp());
                throw new Error("Unable to locate .rc file at location (" + program.rcFile + ")");
            }
            // Use the default .rc file locations
        }
        else {
            for (var _i = 0, RC_FILE_DEFAULT_LOCATIONS_1 = RC_FILE_DEFAULT_LOCATIONS; _i < RC_FILE_DEFAULT_LOCATIONS_1.length; _i++) {
                var path = RC_FILE_DEFAULT_LOCATIONS_1[_i];
                try {
                    env = parse_rc_file_1.useRCFile({ environments: program.environments, path: path });
                    break;
                }
                catch (e) { }
            }
            if (!env) {
                console.log(program.outputHelp());
                throw new Error("Unable to locate .rc file at default locations (" + RC_FILE_DEFAULT_LOCATIONS + ")");
            }
        }
        if (env) {
            returnValue.envValues = env;
            return returnValue;
        }
    }
    // Use env file
    if (program.file) {
        try {
            env = parse_env_file_1.useCmdLine(program.file);
        }
        catch (e) {
            if (!program.fallback) {
                console.log(program.outputHelp());
                console.error("Unable to locate env file at location (" + program.file + ")");
                throw e;
            }
        }
        if (env) {
            returnValue.envValues = env;
            return returnValue;
        }
    }
    // Use the default env file location
    try {
        env = parse_env_file_1.useCmdLine(ENV_FILE_DEFAULT_LOCATION);
    }
    catch (e) {
        console.log(program.outputHelp());
        console.error("Unable to locate env file at default locations (" + ENV_FILE_DEFAULT_LOCATION + ")");
        throw e;
    }
    if (env) {
        returnValue.envValues = env;
        return returnValue;
    }
    console.log(program.outputHelp());
    throw Error('Unable to locate any files to read environment data!');
}
exports.parseArgs = parseArgs;
