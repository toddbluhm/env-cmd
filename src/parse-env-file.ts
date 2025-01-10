import { existsSync, readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveEnvFilePath, IMPORT_HOOK_EXTENSIONS, isPromise } from './utils.js'
import type { Environment } from './types.ts'
import { checkIfTypescriptSupported } from './loaders/typescript.js'

/**
 * Gets the environment vars from an env file
 */
export async function getEnvFileVars(envFilePath: string): Promise<Environment> {
  const absolutePath = resolveEnvFilePath(envFilePath)
  if (!existsSync(absolutePath)) {
    const pathError = new Error(`Invalid env file path (${envFilePath}).`)
    pathError.name = 'PathError'
    throw pathError
  }

  // Get the file extension
  const ext = extname(absolutePath).toLowerCase()
  let env: unknown;
  if (IMPORT_HOOK_EXTENSIONS.includes(ext)) {
    if (/tsx?$/.test(ext)) checkIfTypescriptSupported();

    // For some reason in ES Modules, only JSON file types need to be specifically delinated when importing them
    let attributeTypes = {}
    if (ext === '.json') {
      attributeTypes = { with: { type: 'json' } }
    }
    const res: unknown = await import(pathToFileURL(absolutePath).href, attributeTypes)
    if (typeof res === 'object' && res && 'default' in res) {
      env = res.default
    } else {
      env = res
    }
    // Check to see if the imported value is a promise
    if (isPromise(env)) {
      env = await env
    }

    return normalizeEnvObject(env, absolutePath)
  }

  const file = readFileSync(absolutePath, { encoding: 'utf8' })

  switch (ext) {
    // other loaders can be added here

    default:
      return parseEnvString(file)
  }
}

/**
 * Parse out all env vars from a given env file string and return an object
 */
export function parseEnvString(envFileString: string): Environment {
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
export function parseEnvVars(envString: string): Environment {
  const envParseRegex = /^((.+?)[=](.*))$/gim
  const matches: Environment = {}
  let match
  while ((match = envParseRegex.exec(envString)) !== null) {
    // Note: match[1] is the full env=var line
    const key = match[2].trim()
    let value = match[3].trim()

    // if the string is quoted, remove everything after the final
    // quote. This implicitly removes inline comments.
    if (value.startsWith("'") || value.startsWith('"')) {
      value = value.slice(1, value.lastIndexOf(value[0]));
    } else {
      // if the string is not quoted, we need to explicitly remove
      // inline comments.
      value = value.split('#')[0].trim();
    }

    value = value.replace(/\\n/g, '\n');

    matches[key] = value
  }
  return JSON.parse(JSON.stringify(matches)) as Environment
}

/**
 * Strips out comments from env file string
 */
export function stripComments(envString: string): string {
  const commentsRegex = /(^\s*#.*$)/gim
  return envString.replace(commentsRegex, '')
}

/**
 * Strips out newlines from env file string
 */
export function stripEmptyLines(envString: string): string {
  const emptyLinesRegex = /(^\n)/gim
  return envString.replace(emptyLinesRegex, '')
}

/**
 * If we load data from a file like .js, the user
 * might export something which is not an object.
 *
 * This function ensures that the input is valid,
 * and converts the object's values to strings, for
 * consistincy. See issue #125 for details.
 */
export function normalizeEnvObject(input: unknown, absolutePath: string): Environment {
  if (typeof input !== 'object' || !input) {
    throw new Error(`env-cmd cannot load “${absolutePath}” because it does not export an object.`)
  }

  const env: Environment = {};
  for (const [key, value] of Object.entries(input)) {
    // we're intentionally stringifying the value here, to
    // match what `child_process.spawn` does when loading 
    // env variables.
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    env[key] = `${value}`
  }
  return env
}
