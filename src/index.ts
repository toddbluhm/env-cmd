import * as spawn from 'cross-spawn'
import { handleTermSignals } from './signal-termination'
import { parseArgs } from './parse-args'

/**
 * The main process for reading, parsing, applying and then running the process with env vars
 */
function EnvCmd (args: string[]): { [key: string]: any } {
  // First Parse the args from the command line
  const parsedArgs = parseArgs(args)

  let env
  // Override the merge order if --no-override flag set
  if (parsedArgs.options.noOverride) {
    env = Object.assign({}, parsedArgs.envValues, process.env)
  } else {
    // Add in the system environment variables to our environment list
    env = Object.assign({}, process.env, parsedArgs.envValues)
  }

  // Execute the command with the given environment variables
  const proc = spawn(parsedArgs.command, parsedArgs.commandArgs, {
    stdio: 'inherit',
    env
  })

  // Handle any termination signals for parent and child proceses
  handleTermSignals(proc)

  return env
}

module.exports = {
  EnvCmd
}
