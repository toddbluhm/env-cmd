import { stat, readFile } from 'fs'
import { promisify } from 'util'
import { extname } from 'path'
import { resolveEnvFilePath, isPromise } from './utils'
import { Environment, RCEnvironment } from './types'

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
  let parsedData: Partial<RCEnvironment>
  try {
    if (ext === '.json' || ext === '.js' || ext === '.cjs') {
      const possiblePromise = require(absolutePath) as PromiseLike<RCEnvironment> | RCEnvironment
      parsedData = isPromise(possiblePromise) ? await possiblePromise : possiblePromise
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
