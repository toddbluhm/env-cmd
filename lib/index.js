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
  const env = ParseEnvString(file)

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

function ParseEnvString (envFileString) {
  const envs = Object.assign({}, process.env)
  while (envFileString.length) {
    // The the last index of the line using the newline delimiter
    let endOfLineIndex = envFileString.indexOf('\n')

    // If no newline, then assume end of file
    if (endOfLineIndex === -1) {
      endOfLineIndex = envFileString.length
    }

    // Get the full line
    const line = envFileString.slice(0, endOfLineIndex + 1)

    // Shrink the file by 1 line
    envFileString = envFileString.slice(line.length)

    // Only parse lines that are not empty and don't begin with #
    if (line.length > 1 && line[0] !== '#') {
      // Parse the line
      const equalSign = line.indexOf('=')

      if (equalSign === -1) {
        throw new Error('Error! Malformed line in env file.')
      }

      // Set then new env var
      envs[line.slice(0, equalSign)] = line.slice(equalSign + 1, endOfLineIndex)
    }
  }
  return envs
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
  HandleUncaughtExceptions
}
