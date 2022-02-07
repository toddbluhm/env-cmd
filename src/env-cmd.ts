import { spawn } from './spawn'
import { EnvCmdOptions } from './types'
import { TermSignals } from './signal-termination'
import { parseArgs } from './parse-args'
import { getEnvVars } from './get-env-vars'
import { expandEnvs } from './expand-envs'
import { interpolateEnvs } from './interpolate-envs';

/**
 * Executes env - cmd using command line arguments
 * @export
 * @param {string[]} args Command line argument to pass in ['-f', './.env']
 * @returns {Promise<{ [key: string]: any }>}
 */
export async function CLI (args: string[]): Promise<{ [key: string]: any }> {
  // Parse the args from the command line
  const parsedArgs = parseArgs(args)

  // Run EnvCmd
  try {
    return await (exports.EnvCmd(parsedArgs) as Promise<{ [key: string]: any }>)
  } catch (e) {
    console.error(e)
    return process.exit(1)
  }
}

/**
 * The main env-cmd program. This will spawn a new process and run the given command using
 * various environment file solutions.
 *
 * @export
 * @param {EnvCmdOptions} { command, commandArgs, envFile, rc, options }
 * @returns {Promise<{ [key: string]: any }>} Returns an object containing [environment variable name]: value
 */
export async function EnvCmd (
  {
    command,
    commandArgs,
    envFile,
    rc,
    options = {}
  }: EnvCmdOptions
): Promise<{ [key: string]: any }> {
  let env: { [name: string]: string } = {}
  try {
    env = await getEnvVars({ envFile, rc, verbose: options.verbose })
  } catch (e) {
    if (!(options.silent ?? false)) {
      throw e
    }
  }
  // Override the merge order if --no-override flag set
  if (options.noOverride === true) {
    env = Object.assign({}, env, process.env)
  } else {
    // Add in the system environment variables to our environment list
    env = Object.assign({}, process.env, env)
  }

  if (options.expandEnvs === true) {
    command = expandEnvs(command, env)
    commandArgs = commandArgs.map(arg => expandEnvs(arg, env))
  }
  if (options.interpolateEnvs === true) {
    command = interpolateEnvs(command, env)
    commandArgs = commandArgs.map(arg => interpolateEnvs(arg, env))
  }

  // Execute the command with the given environment variables
  const proc = spawn(command, commandArgs, {
    stdio: 'inherit',
    shell: options.useShell,
    env
  })

  // Handle any termination signals for parent and child proceses
  const signals = new TermSignals({ verbose: options.verbose })
  signals.handleUncaughtExceptions()
  signals.handleTermSignals(proc)

  return env
}
