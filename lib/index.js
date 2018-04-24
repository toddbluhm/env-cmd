'use strict'

const spawn = require('cross-spawn').spawn
const path = require('path')
const fs = require('fs')
const os = require('os')
const rcFileLocation = path.join(process.cwd(), '.env-cmdrc')
const envFilePathDefault = path.join(process.cwd(), '.env')
const terminateSpawnedProcessFuncHandlers = {}
let terminateProcessFuncHandler
const SIGNALS_TO_HANDLE = [
  'SIGINT', 'SIGTERM', 'SIGHUP'
]
const sharedState = {
  exitCalled: false
}

/**
 * The main process for reading, parsing, applying and then running the process with env vars
 * @param       {Array<String>} args And array if strings representing cli args
 *
 * @return      {Object} The child process
 */
function EnvCmd (args) {
  // First Parse the args from the command line
  const parsedArgs = ParseArgs(args)

  // If a .rc file was found then use that
  let parsedEnv
  if (fs.existsSync(rcFileLocation)) {
    parsedEnv = UseRCFile({ envFile: parsedArgs.envFile })
  } else {
    // Try to use a .env file
    parsedEnv = UseCmdLine({ envFile: parsedArgs.envFile, useFallback: parsedArgs.useFallback })
  }

  let env
  // Override the merge order if --no-override flag set
  if (parsedArgs.noOverride) {
    env = Object.assign({}, parsedEnv, process.env)
  } else {
    // Add in the system environment variables to our environment list
    env = Object.assign({}, process.env, parsedEnv)
  }

  // Execute the command with the given environment variables
  const proc = spawn(parsedArgs.command, parsedArgs.commandArgs, {
    stdio: 'inherit',
    env
  })

  // Handle a few special signals and then the general node exit event
  // on both parent and spawned process
  SIGNALS_TO_HANDLE.forEach(signal => {
    terminateSpawnedProcessFuncHandlers[signal] = TerminateSpawnedProc.bind(sharedState, proc, signal)
    process.once(signal, terminateSpawnedProcessFuncHandlers[signal])
  })
  process.once('exit', terminateSpawnedProcessFuncHandlers['SIGTERM'])

  terminateProcessFuncHandler = TerminateParentProcess.bind(sharedState)
  proc.on('exit', terminateProcessFuncHandler)

  return proc
}

/**
 * Parses the arguments passed into the cli
 * @param       {Array<String>} args An array of strings to parse the options out of
 *
 * @return      {Object} An object containing cli options and commands
 */
function ParseArgs (args) {
  if (args.length < 2) {
    throw new Error('Error! Too few arguments passed to env-cmd.')
  }

  let envFile
  let command
  let noOverride
  let useFallback
  let commandArgs = args.slice()
  while (commandArgs.length) {
    const arg = commandArgs.shift()
    if (arg === '--fallback') {
      useFallback = true
      continue
    }
    if (arg === '--no-override') {
      noOverride = true
      continue
    }
    // assume the first arg is the env file (or if using .rc the environment name)
    if (!envFile) {
      envFile = arg
    } else {
      command = arg
      break
    }
  }

  return {
    envFile,
    command,
    commandArgs,
    noOverride,
    useFallback
  }
}

/**
 * Strips out comments from env file string
 * @param       {String} envString The .env file string
 *
 * @return      {String} The .env file string with comments stripped out
 */
function StripComments (envString) {
  const commentsRegex = /(^#.*$)/gim
  let match = commentsRegex.exec(envString)
  let newString = envString
  while (match != null) {
    newString = newString.replace(match[1], '')
    match = commentsRegex.exec(envString)
  }
  return newString
}

/**
 * Strips out newlines from env file string
 * @param       {String} envString The .env file string
 *
 * @return      {String} The .env file string with newlines stripped out
 */
function StripEmptyLines (envString) {
  const emptyLinesRegex = /(^\n)/gim
  return envString.replace(emptyLinesRegex, '')
}

/**
 * Parse out all env vars from an env file string
 * @param       {String} envString The .env file string
 *
 * @return      {Object} Key/Value pairs corresponding to the .env file data
 */
function ParseEnvVars (envString) {
  const envParseRegex = /^((.+?)[=](.*))$/gim
  const matches = {}
  let match
  while ((match = envParseRegex.exec(envString)) !== null) {
    // Note: match[1] is the full env=var line
    const key = match[2].trim()
    let value = match[3].trim() || ''

    // remove any surrounding quotes
    value = value.replace(/(^['"]|['"]$)/g, '')

    matches[key] = value
  }
  return matches
}

/**
 * Parse out all env vars from a given env file string and return an object
 * @param       {String} envString The .env file string
 *
 * @return      {Object} Key/Value pairs of all env vars parsed from files
 */
function ParseEnvString (envFileString) {
  // First thing we do is stripe out all comments
  envFileString = StripComments(envFileString.toString())

  // Next we stripe out all the empty lines
  envFileString = StripEmptyLines(envFileString)

  // Merge the file env vars with the current process env vars (the file vars overwrite process vars)
  return ParseEnvVars(envFileString)
}

/**
 * Reads and parses the .env-cmdrc file
 * @param       {String} fileData the .env-cmdrc file data (which should be a valid json string)
 *
 * @return      {Object} The .env-cmdrc as a parsed JSON object
 */
function ParseRCFile (fileData) {
  let data
  try {
    data = JSON.parse(fileData)
  } catch (e) {
    console.error(`Error:
  Could not parse the .env-cmdrc file.
  Please make sure its in a valid JSON format.`)
    throw new Error(`Unable to parse JSON in .env-cmdrc file.`)
  }
  return data
}

/**
 * Uses the rc file to get env vars
 * @param       {Object} options
 * @param       {String} options.envFile The .env-cmdrc file environment to use
 *
 * @return      {Object} Key/Value pair of env vars from the .env-cmdrc file
 */
function UseRCFile (options) {
  const fileData = fs.readFileSync(rcFileLocation, { encoding: 'utf8' })
  const parsedData = ParseRCFile(fileData)

  let result = {}
  const envNames = options.envFile.split(',')
  if (envNames.length === 1 && !parsedData[envNames[0]]) {
    console.error(`Error:
  Could not find environment:
    ${options.envFile}
  in .rc file:
    ${rcFileLocation}`)
    throw new Error(`Missing environment ${options.envFile} in .env-cmdrc file.`)
  }

  envNames.forEach(function (name) {
    const envVars = parsedData[name]
    if (envVars) {
      result = Object.assign(result, envVars)
    }
  })
  return result
}

/**
 * Uses the cli passed env file to get env vars
 * @param       {Object}  options
 * @param       {String}  options.envFile       The .env file name/relative path
 * @param       {Boolean} options.useFallback   Should we attempt to find a fallback file
 *
 * @return      {Object}  Key/Value pairing of env vars found in .env file
 */
function UseCmdLine (options) {
  const envFilePath = ResolveEnvFilePath(options.envFile)

  // Attempt to open the provided file
  let file
  try {
    file = fs.readFileSync(envFilePath, { encoding: 'utf8' })
  } catch (err) {
    if (!options.useFallback) {
      return {}
    }
  }

  // If we don't have a main file try the fallback file
  if (!file && options.useFallback) {
    try {
      file = fs.readFileSync(envFilePathDefault)
    } catch (e) {
      throw new Error(`Error! Could not find fallback file or read env file at ${envFilePathDefault}`)
    }
  }

  // Get the file extension
  const ext = path.extname(envFilePath).toLowerCase()

  // Parse the env file string using the correct parser
  const env = ext === '.json' || ext === '.js'
    ? require(envFilePath)
    : ParseEnvString(file)

  return env
}

/**
 * Prints out some minor help text
 * @return       {String} Help text
 */
function PrintHelp () {
  return `
Usage: env-cmd [options] [env_file | env_name] command [command options]

A simple utility for running a cli application using an env config file.

Also supports using a .env-cmdrc json file in the execution directory to support multiple
environment configs in one file.

Options:
  --no-override - do not override existing process env vars with file env vars
  --fallback - if provided env file does not exist, attempt to use fallback .env file in root dir
  `
}

/**
 * General exception handler
 * @param       {Error} e The exception error to handle
 */
function HandleUncaughtExceptions (e) {
  if (e.message.match(/passed/gi)) {
    console.log(PrintHelp())
  }
  console.log(e.message)
  process.exit(1)
}

/**
 * A simple function for resolving the path the user entered
 * @param       {String} userPath A path
 * @return      {String} The fully qualified absolute path
 */
function ResolveEnvFilePath (userPath) {
  // Make sure a home directory exist
  const home = os.homedir()
  if (home) {
    userPath = userPath.replace(/^~($|\/|\\)/, `${home}$1`)
  }
  return path.resolve(process.cwd(), userPath)
}

/**
 * Helper for terminating the spawned process
 * @param       {ProccessHandler} proc The spawned process handler
 */
function TerminateSpawnedProc (proc, signal, code) {
  RemoveProcessListeners()

  if (!this.exitCalled) {
    this.exitCalled = true
    proc.kill(signal)
  }

  if (code) {
    return process.exit(code)
  }

  process.kill(process.pid, signal)
}

/**
 * Helper for terminating the parent process
 */
function TerminateParentProcess (code, signal) {
  RemoveProcessListeners()

  if (!this.exitCalled) {
    this.exitCalled = true
    if (signal) {
      return process.kill(process.pid, signal)
    }
    process.exit(code)
  }
}

/**
 * Helper for removing all termination signal listeners from parent process
 */
function RemoveProcessListeners () {
  SIGNALS_TO_HANDLE.forEach(signal => {
    process.removeListener(signal, terminateSpawnedProcessFuncHandlers[signal])
  })
  process.removeListener('exit', terminateSpawnedProcessFuncHandlers['SIGTERM'])
}

process.on('uncaughtException', HandleUncaughtExceptions)

module.exports = {
  EnvCmd,
  ParseArgs,
  ParseEnvString,
  PrintHelp,
  HandleUncaughtExceptions,
  TerminateSpawnedProc,
  TerminateParentProcess,
  StripComments,
  StripEmptyLines,
  ParseEnvVars,
  ParseRCFile,
  UseRCFile,
  UseCmdLine,
  ResolveEnvFilePath
}
