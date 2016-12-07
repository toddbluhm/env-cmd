'use strict'

const spawn = require('cross-spawn').spawn
const path = require('path')
const fs = require('fs')
const rcFileLocation = path.join(process.cwd(), '.env-cmdrc')

function EnvCmd (args) {
  // First Parse the args from the command line
  const parsedArgs = ParseArgs(args)

  // If a .rc file was found then use that
  let env = fs.existsSync(rcFileLocation) ? UseRCFile(parsedArgs) : UseCmdLine(parsedArgs)

  // Add in the system environment variables to our environment list
  env = Object.assign({}, process.env, env)

  // Execute the command with the given environment variables
  const proc = spawn(parsedArgs.command, parsedArgs.commandArgs, {
    stdio: 'inherit',
    env
  })
  process.on('SIGTERM', proc.kill.bind(proc, 'SIGTERM'))
  proc.on('exit', process.exit)
  return proc
}

// Parses the arguments passed into the cli
function ParseArgs (args) {
  if (args.length < 2) {
    throw new Error('Error! Too few arguments passed to env-cmd.')
  }

  let envFile
  let command
  let commandArgs = args.slice()
  while (commandArgs.length) {
    const arg = commandArgs.shift()

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
    commandArgs
  }
}

// Strips out comments from env file string
function StripComments (envString) {
  const commentsRegex = /("{1}.*"{1})*?([ ]*#.*$)/gim
  let match = commentsRegex.exec(envString)
  let newString = envString
  while (match != null) {
    newString = newString.replace(match[2], '')
    match = commentsRegex.exec(envString)
  }
  return newString
}

// Strips out newlines from env file string
function StripEmptyLines (envString) {
  const emptyLinesRegex = /(^\n)/gim
  return envString.replace(emptyLinesRegex, '')
}

// Stripes out double quotes to allow for usage for special # in values
function StripDoubleQuotes (envString) {
  const doubleQuotesRegex = /"{1}(.*)"{1}/gim
  let match = doubleQuotesRegex.exec(envString)
  let newString = envString
  while (match != null) {
    newString = newString.replace(match[0], match[1])
    match = doubleQuotesRegex.exec(envString)
  }
  return newString
}

// Parse out all env vars from an env file string
function ParseEnvVars (envString) {
  const envParseRegex = /^((.+?)[ =](.*))$/gim
  const matches = {}
  let match
  while ((match = envParseRegex.exec(envString)) !== null) {
    // Note: match[1] is the full env=var line
    matches[match[2]] = match[3]
  }
  return matches
}

// Parse out all env vars from a given env file string and return an object
function ParseEnvString (envFileString) {
  // First thing we do is stripe out all comments
  envFileString = StripComments(envFileString)

  // Next we stripe out all the empty lines
  envFileString = StripEmptyLines(envFileString)

  // Finally we stripe out all the double quotes for special charactes
  envFileString = StripDoubleQuotes(envFileString)

  // Parse the envs vars out
  const envs = ParseEnvVars(envFileString)

  // Merge the file env vars with the current process env vars (the file vars overwrite process vars)
  return Object.assign({}, process.env, envs)
}

// Reads and parses the .env-cmdrc file
function ParseRCFile (fileData) {
  return JSON.parse(fileData)
}

// Uses the rc file to get env vars
function UseRCFile (parsedArgs) {
  const fileData = fs.readFileSync(rcFileLocation, { encoding: 'utf8' })
  const parsedData = ParseRCFile(fileData)
  return parsedData[parsedArgs.envFile]
}

// Uses the cli passed env file to get env vars
function UseCmdLine (parsedArgs) {
  const envFilePath = path.join(process.cwd(), parsedArgs.envFile)

  // Attempt to open the provided file
  let file
  try {
    file = fs.readFileSync(envFilePath, { encoding: 'utf8' })
  } catch (e) {
    throw new Error(`Error! Could not find or read file at ${envFilePath}`)
  }

  const ext = path.extname(envFilePath).toLowerCase()

  // Parse the env file string using the correct parser
  const env = ext === '.json' || ext === '.js'
    ? require(envFilePath)
    : ParseEnvString(file)

  return env
}

// Prints out some minor help text
function PrintHelp () {
  return `
Usage: env-cmd [env_file | env_name] command [command options]

A simple utility for running a cli application using an env config file.

Also supports using a .env-cmdrc json file in the execution directory to support multiple
environment configs in one file.
  `
}

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
  StripDoubleQuotes,
  ParseEnvVars,
  ParseRCFile,
  UseRCFile,
  UseCmdLine
}
