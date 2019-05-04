import { Command } from 'commander'
import { EnvCmdOptions } from './types'
import { parseArgList } from './utils'

/**
* Parses the arguments passed into the cli
*/
export function parseArgs (args: string[]): EnvCmdOptions {
  const program = new Command()
  program
    .version('9.0.0', '-v, --version')
    .usage('[options] <command> [...args]')
    .option('-f, --file [path]', 'Custom .env file location (default location: ./.env)')
    .option('-r, --rc-file [path]', 'Custom .env-cmdrc file location (default location: ./.env-cmdrc(|.js|.json)')
    .option('-e, --environments [env1,env2,...]', 'The rc-file environments to select', parseArgList)
    .option('--fallback', 'Enables auto fallback to default env file location ./.env')
    .option('--no-override', 'Do not override existing env vars on process.env')
    .option('--use-shell', 'Make env variables available to multiple commands and as command line arguments')
    .parse(['_', '_', ...args])

  // get the command and command args
  const command = program.args[0]
  const commandArgs = program.args.slice(1)
  const noOverride = !program.override
  const useShell = !!program.useShell

  let rc: any
  if (program.environments && program.environments.length) {
    rc = rc || {}
    rc.environments = program.environments
    rc.filePath = program.rcFile
  }

  let envFile: any
  if (program.file) {
    envFile = envFile || {}
    envFile.filePath = program.file
    envFile.fallback = program.fallback
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
  }
}
