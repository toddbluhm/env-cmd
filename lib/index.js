const spawn = require('cross-spawn').spawn
const path = require('path')
const fs = require('fs')

function EnvCmd (args) {
  const { envFilePath, command, commandArgs } = ParseArgs(args)
  const env = ParseEnvFile(envFilePath)
  if (command) {
    const proc = spawn(command, commandArgs, {
      stdio: 'inherit',
      env
    })
    process.on('SIGTERM', () => proc.kill('SIGTERM'))
    proc.on('exit', process.exit)
    return proc
  }
}

function ParseArgs (args) {
  if(args.length < 3) {
    throw new Error("Too few arguments passed to envCmd.")
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
    throw new Error('Error, No -e or --env flag passed.')
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
      throw new Error(`Error, Malformed line in ${path.parse(envFilePath).base}.`)
    }

    // Set then new env var
    envs[line.slice(0, equalSign)] = line.slice(line.indexOf('=') + 1, -1)
  }
  return envs
}

module.exports = {
  EnvCmd,
  ParseArgs,
  ParseEnvFile
}
