import { Command } from 'commander'
import { EnvCmdOptions } from './types'
import { parseArgList } from './utils'

// Use commonjs require to prevent a weird folder hierarchy in dist
const packageJson = require('../package.json') /* eslint-disable-line */

/**
* Parses the arguments passed into the cli
*/
export function parseArgs (args: string[]): EnvCmdOptions {
  // Get the command and command args
  let program = parseArgsUsingCommander(args)
  const command = program.args[0]
  const commandArgs = args.splice(args.indexOf(command) + 1)

  // Reprocess the args with the command and command args removed
  program = parseArgsUsingCommander(args.slice(0, args.indexOf(command)))
  const noOverride = !(program.override as boolean)
  const useShell = !!(program.useShell as boolean)
  const expandEnvs = !!(program.expandEnvs as boolean)
  const verbose = !!(program.verbose as boolean)

  let rc: any
  if (program.environments !== undefined && program.environments.length !== 0) {
    rc = {
      environments: program.environments,
      filePath: program.rcFile
    }
  }

  let envFile: any
  if (program.file !== undefined) {
    envFile = {
      filePath: program.file,
      fallback: program.fallback
    }
  }

  const options = {
    command,
    commandArgs,
    envFile,
    rc,
    options: {
      noOverride,
      useShell,
      verbose,
      expandEnvs
    }
  }
  if (verbose === true) {
    console.info(`Options: ${JSON.stringify(options, null, 0)}`)
  }
  return options
}

export function parseArgsUsingCommander (args: string[]): Command {
  const program = new Command()
  return program
    .version(packageJson.version, '-v, --version')
    .usage('[options] <command> [...args]')
    .option('-f, --file [path]', 'Custom env file path (default path: ./.env)')
    .option('-r, --rc-file [path]', 'Custom rc file path (default path: ./.env-cmdrc(|.js|.json)')
    .option('-e, --environments [env1,env2,...]', 'The rc file environment(s) to use', parseArgList)
    .option('--fallback', 'Fallback to default env file path, if custom env file path not found')
    .option('--no-override', 'Do not override existing environment variables')
    .option('--use-shell', 'Execute the command in a new shell with the given environment')
    .option('-x, --expand-envs', 'Replace $var in args and command with environment variables')
    .option('--verbose', 'Print helpful debugging information')
    .parse(['_', '_', ...args])
}
