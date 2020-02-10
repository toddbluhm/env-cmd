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
  const silent = !!(program.silent as boolean)

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
      expandEnvs,
      noOverride,
      silent,
      useShell,
      verbose
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
    .option('-e, --environments [env1,env2,...]', 'The rc file environment(s) to use', parseArgList)
    .option('-f, --file [path]', 'Custom env file path (default path: ./.env)')
    .option('--fallback', 'Fallback to default env file path, if custom env file path not found')
    .option('--no-override', 'Do not override existing environment variables')
    .option('-r, --rc-file [path]', 'Custom rc file path (default path: ./.env-cmdrc(|.js|.json)')
    .option('--silent', 'Ignore any env-cmd errors and only fail on executed program failure.')
    .option('--use-shell', 'Execute the command in a new shell with the given environment')
    .option('--verbose', 'Print helpful debugging information')
    .option('-x, --expand-envs', 'Replace $var in args and command with environment variables')
    .parse(['_', '_', ...args])
}
