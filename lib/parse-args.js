"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const utils_1 = require("./utils");
/**
* Parses the arguments passed into the cli
*/
function parseArgs(args) {
    const program = new commander_1.Command();
    program
        .version('9.0.0', '-v, --version')
        .usage('[options] <command> [...args]')
        .option('-f, --file [path]', 'Custom .env file location (default location: ./.env)')
        .option('-r, --rc-file [path]', 'Custom .env-cmdrc file location (default location: ./.env-cmdrc(|.js|.json)')
        .option('-e, --environments [env1,env2,...]', 'The rc-file environments to select', utils_1.parseArgList)
        .option('--fallback', 'Enables auto fallback to default env file location ./.env')
        .option('--no-override', 'Do not override existing env vars on process.env')
        .parse(['_', '_', ...args]);
    // get the command and command args
    const command = program.args[0];
    const commandArgs = program.args.slice(1);
    const noOverride = !program.override;
    let rc;
    if (program.environments && program.environments.length) {
        rc = rc || {};
        rc.environments = program.environments;
    }
    if (program.rcFile) {
        rc = rc || {};
        rc.filePath = program.rcFile;
    }
    let envFile;
    if (program.file) {
        envFile = envFile || {};
        envFile.filePath = program.file;
    }
    if (program.fallback != null) {
        envFile = envFile || {};
        envFile.fallback = program.fallback;
    }
    return {
        command,
        commandArgs,
        envFile,
        rc,
        options: {
            noOverride
        }
    };
}
exports.parseArgs = parseArgs;
