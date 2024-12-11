import { existsSync, readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveEnvFilePath, IMPORT_HOOK_EXTENSIONS, isPromise } from './utils.js'
import type { Environment } from './types.ts'
import { parseEnvString } from './loaders/env.js';

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
  let env: Environment = {}
  if (IMPORT_HOOK_EXTENSIONS.includes(ext)) {
    // For some reason in ES Modules, only JSON file types need to be specifically delinated when importing them
    let attributeTypes = {}
    if (ext === '.json') {
      attributeTypes = { with: { type: 'json' } }
    }
    const res = await import(pathToFileURL(absolutePath).href, attributeTypes) as Environment | { default: Environment }
    if ('default' in res) {
      env = res.default as Environment
    } else {
      env = res
    }
    // Check to see if the imported value is a promise
    if (isPromise(env)) {
      env = await env
    }
    return env;
  }

  const file = readFileSync(absolutePath, { encoding: 'utf8' })

  switch (ext) {
    default:
      return parseEnvString(file)
  }
}
