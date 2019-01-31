import * as program from 'commander'
import { parseArgList } from './utils'
import { useRCFile } from './parse-rc-file'
import { useCmdLine } from './parse-env-file'

const RC_FILE_DEFAULT_LOCATIONS = ['./.env-cmdrc', './.env-cmdrc.json']
const ENV_FILE_DEFAULT_LOCATION = './.env'

type parseArgsReturnVal = {
  envValues: { [key: string]: any }
  command: string
  commandArgs: string[]
  options: {
    noOverride: boolean
  }
}

/**
* Parses the arguments passed into the cli
*/
export function parseArgs (args: string[]): parseArgsReturnVal {
  program
    .version('1.0.0', '-v, --version')
    .usage('[options] <command> [...args]')
    .option('-f, --file [path]', 'Custom .env file location')
    .option('-r, --rc-file [path]', 'Custom .env-cmdrc file location')
    .option('-e, --environments [env...]', 'The rc-file environment to select', parseArgList)
    .option('--fallback', 'Enables auto fallback to default env file location')
    .option('--no-override', 'Do not override existing env vars')
    .parse(['_', '_', ...args])

  // get the command and command args
  const command = program.args[0]
  const commandArgs = program.args.slice(1)
  const noOverride = !program.override

  const returnValue: any = {
    command,
    commandArgs,
    options: {
      noOverride
    }
  }

  // Check for rc file usage
  let env
  if (program.environments) {
    // user provided an .rc file path
    if (program.rcFile) {
      try {
        env = useRCFile({ environments: program.environments, path: program.rcFile })
      } catch (e) {
        console.log(program.outputHelp())
        throw new Error(`Unable to locate .rc file at location (${program.rcFile})`)
      }
    // Use the default .rc file locations
    } else {
      for (const path of RC_FILE_DEFAULT_LOCATIONS) {
        try {
          env = useRCFile({ environments: program.environments, path })
          break
        } catch (e) {}
      }
      if (!env) {
        console.log(program.outputHelp())
        throw new Error(`Unable to locate .rc file at default locations (${RC_FILE_DEFAULT_LOCATIONS})`)
      }
    }

    if (env) {
      returnValue.envValues = env
      return returnValue
    }
  }

  // Use env file
  if (program.file) {
    try {
      env = useCmdLine(program.file)
    } catch (e) {
      if (!program.fallback) {
        console.log(program.outputHelp())
        console.error(`Unable to locate env file at location (${program.file})`)
        throw e
      }
    }

    if (env) {
      returnValue.envValues = env
      return returnValue
    }
  }

  // Use the default env file location
  try {
    env = useCmdLine(ENV_FILE_DEFAULT_LOCATION)
  } catch (e) {
    console.log(program.outputHelp())
    console.error(`Unable to locate env file at default locations (${ENV_FILE_DEFAULT_LOCATION})`)
    throw e
  }

  if (env) {
    returnValue.envValues = env
    return returnValue
  }

  console.log(program.outputHelp())
  throw Error('Unable to locate any files to read environment data!')
}
