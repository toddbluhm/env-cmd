'use strict'

const spawn = require('cross-spawn').spawn
const path = require('path')
const fs = require('fs')

process.on('uncaughtException', function (e) {
  if (e.message.match(/passed/gi)) {
    console.log(PrintHelp())
  }
  console.log(e.message)
  process.exit(1)
})

function EnvCmd (args) {
  const parsedArgs = ParseArgs(args)
  const env = ParseEnvFile(parsedArgs.envFilePath)
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
  if (args.length < 3) {
    throw new Error('Error! Too few arguments passed to env-cmd.')
  }

  const envFileFlags = /(^\-e$|^\-\-env$)/g
  let envFilePath
  let command
  let commandArgs = args.slice()
  while (commandArgs.length) {
    const arg = commandArgs.shift()

    // if this is the env file flag the get the file
    if (arg.match(envFileFlags)) {
      envFilePath = path.resolve(process.cwd(), commandArgs.shift())
    } else {
      command = arg
      break
    }
  }

  if (!envFilePath) {
    throw new Error('Error! No -e or --env flag passed.')
  }

  return {
    envFilePath,
    command,
    commandArgs
  }
}

function ParseEnvFile (envFilePath) {
  let file = fs.readFileSync(envFilePath, { encoding: 'utf8' })
  const envs = Object.assign({}, process.env)
  while (file.length) {
    // Get the full line
    const line = file.slice(0, file.indexOf('\n') + 1)

    // Shrink the file by 1 line
    file = file.slice(line.length)

    // Parse the line
    const equalSign = line.indexOf('=')

    if (equalSign === -1) {
      throw new Error(`Error! Malformed line in ${path.parse(envFilePath).base}.`)
    }

    // Set then new env var
    envs[line.slice(0, equalSign)] = line.slice(line.indexOf('=') + 1, -1)
  }
  return envs
}

function PrintHelp () {
  return `
Usage: env-cmd -e [file] command [command options]

A simple application for running a cli application using an env config file

Options:

  -e, --env        Relative path to the env file
  `
}

module.exports = {
  EnvCmd,
  ParseArgs,
  ParseEnvFile,
  PrintHelp
}
