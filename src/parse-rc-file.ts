import { stat, readFile } from 'node:fs'
import { promisify } from 'node:util'
import { extname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveEnvFilePath, IMPORT_HOOK_EXTENSIONS, isPromise, importAttributesKeyword } from './utils.js'
import type { Environment, RCEnvironment } from './types.ts'

const statAsync = promisify(stat)
const readFileAsync = promisify(readFile)

/**
 * Gets the env vars from the rc file and rc environments
 */
export async function getRCFileVars(
  { environments, filePath }:
  { environments: string[], filePath: string },
): Promise<Environment> {
  const absolutePath = resolveEnvFilePath(filePath)
  try {
    await statAsync(absolutePath)
  }
  catch {
    const pathError = new Error(`Failed to find .rc file at path: ${absolutePath}`)
    pathError.name = 'PathError'
    throw pathError
  }

  // Get the file extension
  const ext = extname(absolutePath).toLowerCase()
  let parsedData: Partial<RCEnvironment> = {}
  try {
    if (IMPORT_HOOK_EXTENSIONS.includes(ext)) {
      // For some reason in ES Modules, only JSON file types need to be specifically delinated when importing them
      let attributeTypes = {}
      if (ext === '.json') {
        attributeTypes = { [importAttributesKeyword]: { type: 'json' } }
      }
      const res = await import(pathToFileURL(absolutePath).href, attributeTypes) as RCEnvironment | { default: RCEnvironment }
      if ('default' in res) {
        parsedData = res.default as RCEnvironment
      } else {
        parsedData = res
      }
      // Check to see if the imported value is a promise
      if (isPromise(parsedData)) {
        parsedData = await parsedData
      }
    }
    else {
      const file = await readFileAsync(absolutePath, { encoding: 'utf8' })
      parsedData = JSON.parse(file) as Partial<RCEnvironment>
    }
  }
  catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    const parseError = new Error(
      `Failed to parse .rc file at path: ${absolutePath}.\n${errorMessage}`,
    )
    parseError.name = 'ParseError'
    throw parseError
  }

  // Parse and merge multiple rc environments together
  let result: Environment = {}
  let environmentFound = false
  for (const name of environments) {
    if (name in parsedData) {
      const envVars = parsedData[name]
      if (envVars != null && typeof envVars === 'object') {
        environmentFound = true
        result = {
          ...result,
          ...envVars,
        }
      }
    }
  }

  if (!environmentFound) {
    const environmentError = new Error(
      `Failed to find environments [${environments.join(',')}] at .rc file location: ${absolutePath}`,
    )
    environmentError.name = 'EnvironmentError'
    throw environmentError
  }

  return result
}
