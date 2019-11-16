import * as fs from 'fs'
import * as path from 'path'
import { resolveEnvFilePath, isPromise } from './utils'

const REQUIRE_HOOK_EXTENSIONS = ['.json', '.js']

/**
 * Gets the environment vars from an env file
 */
export async function getEnvFileVars (envFilePath: string): Promise<{ [key: string]: any }> {
  const absolutePath = resolveEnvFilePath(envFilePath)
  if (!fs.existsSync(absolutePath)) {
    const pathError = new Error(`Invalid env file path (${envFilePath}).`)
    pathError.name = 'PathError'
    throw pathError
  }

  // Get the file extension
  const ext = path.extname(absolutePath).toLowerCase()
  let env = {}
  if (REQUIRE_HOOK_EXTENSIONS.indexOf(ext) > -1) {
    const possiblePromise = require(absolutePath) /* eslint-disable-line */
    env = isPromise(possiblePromise) ? await possiblePromise : possiblePromise
  } else {
    const file = fs.readFileSync(absolutePath, { encoding: 'utf8' })
    env = parseEnvString(file)
  }
  return env
}

/**
 * Parse out all env vars from a given env file string and return an object
 */
export function parseEnvString (envFileString: string): { [key: string]: string } {
  // First thing we do is stripe out all comments
  envFileString = stripComments(envFileString.toString())

  // Next we stripe out all the empty lines
  envFileString = stripEmptyLines(envFileString)

  // Merge the file env vars with the current process env vars (the file vars overwrite process vars)
  return parseEnvVars(envFileString)
}

/**
 * Parse out all env vars from an env file string
 */
export function parseEnvVars (envString: string): { [key: string]: string } {
  const envParseRegex = /^((.+?)[=](.*))$/gim
  const matches: { [key: string]: string } = {}
  let match
  while ((match = envParseRegex.exec(envString)) !== null) {
    // Note: match[1] is the full env=var line
    const key = match[2].trim()
    const value = match[3].trim()

    // remove any surrounding quotes
    matches[key] = value
      .replace(/(^['"]|['"]$)/g, '')
      .replace(/\\n/g, '\n')
  }
  return matches
}

/**
 * Strips out comments from env file string
 */
export function stripComments (envString: string): string {
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
 */
export function stripEmptyLines (envString: string): string {
  const emptyLinesRegex = /(^\n)/gim
  return envString.replace(emptyLinesRegex, '')
}
