"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Prints out some minor help text
 * @return       {String} Help text
 */
function PrintHelp() {
    return "\nUsage: env-cmd [options] [env_file | env_name] command [command options]\n\nA simple utility for running a cli application using an env config file.\n\nAlso supports using a .env-cmdrc json file in the execution directory to support multiple\nenvironment configs in one file.\n\nOptions:\n  --no-override - do not override existing process env vars with file env vars\n  --fallback - if provided env file does not exist, attempt to use fallback .env file in root dir\n  ";
}
exports.PrintHelp = PrintHelp;
