'use strict'

const spawn = require('cross-spawn').spawn
const path = require('path')
const fs = require('fs')
const ParseArgs = require('./parse-args')

function EnvCmd (args) {
  // Parse the args from the command line
  const parsedArgs = ParseArgs(args)
  const files = parsedArgs.files
  const command = parsedArgs.command
  const commandArgs = parsedArgs.commandArgs

  // For all files..
  let env = files.reduce((env, file) => {
    try {
      // Attempt to open the provided file
      const envFileText = fs.readFileSync(file, 'utf8')

      // Parse the env file string
      if (path.extname(file) === '.json') {
        Object.assign(env, require(file))
      } else {
        const parsedEnv = ParseEnvString(envFileText)
        Object.assign(env, parsedEnv)
      }
      return env
    } catch (e) {
      throw new Error(`Error! Could not find or read file at ${file}`)
    }
  }, {})

  // Execute the command with the given environment variables
  const proc = spawn(command, commandArgs, {
    stdio: 'inherit',
    env
  })
  process.on('SIGTERM', () => proc.kill('SIGTERM'))
  proc.on('exit', process.exit)
  return proc
}

function StripComments (envString) {
  const commentsRegex = /[ ]*((\#|\/\/).*$)/gim
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
Usage:
  env-cmd env_file command [command options]
  env-cmd -e env_file1 [env_file2] -c command [command options]

Options:
  -e, --env-file  Env file(s) to load
  -c, --command   Command to execute

A simple application for running a cli application using an env config file
  `
}

function HandleUncaughtExceptions (e) {
  if (e.message.match(/passed|missing/gi)) {
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
