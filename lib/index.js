'use strict'

const { spawn } = require('cross-spawn')
const path = require('path')
const fs = require('fs')
const rcFileLocation = path.join(process.cwd(), '.env-cmdrc')
const envFilePathDefault = path.join(process.cwd(), '.env')

/**
 * The main process for reading, parsing, applying and then running the process with env vars
 * @param       {Array<String>} args And array if strings representing cli args
 *
 * @return      {Object} The child process
 */
function EnvCmd (args) {
  // First Parse the args from the command line
  const {
    envFile,
    command,
    commandArgs,
    noOverride,
    useFallback
  } = ParseArgs(args)

  // If a .rc file was found then use that
  let parsedEnv
  if (fs.existsSync(rcFileLocation)) {
    parsedEnv = UseRCFile({ envFile })
  } else {
    // Try to use a .env file
    parsedEnv = UseCmdLine({ envFile, useFallback })
  }

  let env
  // Override the merge order if --no-override flag set
  if (noOverride) {
    env = Object.assign({}, parsedEnv, process.env)
  } else {
    // Add in the system environment variables to our environment list
    env = Object.assign({}, process.env, parsedEnv)
  }

  // Execute the command with the given environment variables
  const proc = spawn(command, commandArgs, {
    stdio: 'inherit',
    env
  })
  process.on('SIGTERM', proc.kill.bind(proc, 'SIGTERM'))
  proc.on('exit', process.exit)
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
    matches[match[2]] = match[3]
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
 * @param       {Object}
 * @param       {String} envFile The .env-cmdrc file environment to use
 *
 * @return      {Object} Key/Value pair of env vars from the .env-cmdrc file
 */
function UseRCFile ({ envFile }) {
  const fileData = fs.readFileSync(rcFileLocation, { encoding: 'utf8' })
  const parsedData = ParseRCFile(fileData)

  let result = {}
  const envNames = envFile.split(',')

  if (envNames.length === 1 && !parsedData[envNames[0]]) {
    console.error(`Error:
  Could not find environment:
    ${envFile}
  in .rc file:
    ${rcFileLocation}`)
    throw new Error(`Missing environment ${envFile} in .env-cmdrc file.`)
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
 * @param       {Object}                The parsed cli options and commands
 * @param       {String}  envFile       The .env file name/relative path
 * @param       {Boolean} useFallback   Should we attempt to find a fallback file
 *
 * @return      {Object}  Key/Value pairing of env vars found in .env file
 */
function UseCmdLine ({
  envFile,
  useFallback
}) {
  const envFilePath = path.join(process.cwd(), envFile)

  // Attempt to open the provided file
  let file
  try {
    file = fs.readFileSync(envFilePath, { encoding: 'utf8' })
  } catch (err) {
    if (!useFallback) {
      return {}
    }
  }

  // If we don't have a main file try the fallback file
  if (!file && useFallback) {
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

process.on('uncaughtException', HandleUncaughtExceptions)

module.exports = {
  EnvCmd,
  ParseArgs,
  ParseEnvString,
  PrintHelp,
  HandleUncaughtExceptions,
  StripComments,
  StripEmptyLines,
  ParseEnvVars,
  ParseRCFile,
  UseRCFile,
  UseCmdLine
}
