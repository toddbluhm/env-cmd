'use strict'

const spawn = require('cross-spawn').spawn
const path = require('path')
const fs = require('fs')

function EnvCmd (args) {
  // Parse the args from the command line
  const parsedArgs = ParseArgs(args)

  // Attempt to open the provided file
  let file
  try {
    file = fs.readFileSync(parsedArgs.envFilePath, { encoding: 'utf8' })
  } catch (e) {
    throw new Error(`Error! Could not find or read file at ${parsedArgs.envFilePath}`)
  }

  // Parse the env file string
  const env = path.extname(parsedArgs.envFilePath).toLowerCase() === '.json'
    ? Object.assign({}, process.env, require(parsedArgs.envFilePath))
    : ParseEnvString(file)

  // Execute the command with the given environment variables
  if (parsedArgs.command) {
    const proc = spawn(parsedArgs.command, parsedArgs.commandArgs, {
      stdio: 'inherit',
      env
    })
    process.on('SIGTERM', () => proc.kill('SIGTERM'))
    proc.on('exit', process.exit)
    return proc
  }
}

function ParseArgs (args) {
  if (args.length < 2) {
    throw new Error('Error! Too few arguments passed to env-cmd.')
  }

  let envFilePath
  let command
  let commandArgs = args.slice()
  while (commandArgs.length) {
    const arg = commandArgs.shift()

    // assume the first arg is the env file
    if (!envFilePath) {
      envFilePath = path.resolve(process.cwd(), arg)
    } else {
      command = arg
      break
    }
  }

  return {
    envFilePath,
    command,
    commandArgs
  }
}

function StripComments (envString) {
  const commentsRegex = /[ ]*(#.*$)/gim
  return envString.replace(commentsRegex, '')
}

function StripEmptyLines (envString) {
  const emptyLinesRegex = /(^\n)/gim
  return envString.replace(emptyLinesRegex, '')
}

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

function ParseEnvString (envFileString) {
  // First thing we do is stripe out all comments
  envFileString = StripComments(envFileString)

  // Next we stripe out all the empty lines
  envFileString = StripEmptyLines(envFileString)

  // Parse the envs vars out
  const envs = ParseEnvVars(envFileString)

  // Merge the file env vars with the current process env vars (the file vars overwrite process vars)
  return Object.assign({}, process.env, envs)
}

function PrintHelp () {
  return `
Usage: env-cmd env_file command [command options]

A simple application for running a cli application using an env config file
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
  ParseEnvVars
}
