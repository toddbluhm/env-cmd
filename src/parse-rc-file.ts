import { stat, readFile } from 'fs'
import { promisify } from 'util'
import { extname } from 'path'
import { resolveEnvFilePath, isPromise } from './utils'

const statAsync = promisify(stat)
const readFileAsync = promisify(readFile)

/**
 * Gets the env vars from the rc file and rc environments
 */
export async function getRCFileVars (
  { environments, filePath }:
  { environments: string[], filePath: string }
): Promise<{ [key: string]: any }> {
  const absolutePath = resolveEnvFilePath(filePath)
  try {
    await statAsync(absolutePath)
  } catch (e) {
    const pathError = new Error(`Failed to find .rc file at path: ${absolutePath}`)
    pathError.name = 'PathError'
    throw pathError
  }

  // Get the file extension
  const ext = extname(absolutePath).toLowerCase()
  let parsedData: { [key: string]: any }
  try {
    if (ext === '.json' || ext === '.js' || ext === '.cjs') {
      const possiblePromise = require(absolutePath) /* eslint-disable-line */
      parsedData = isPromise(possiblePromise) ? await possiblePromise : possiblePromise
    } else {
      const file = await readFileAsync(absolutePath, { encoding: 'utf8' })
      parsedData = JSON.parse(file)
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    const parseError = new Error(
      `Failed to parse .rc file at path: ${absolutePath}.\n${errorMessage}`
    )
    parseError.name = 'ParseError'
    throw parseError
  }

  // Parse and merge multiple rc environments together
  let result = {}
  let environmentFound = false
  environments.forEach((name): void => {
    const envVars = parsedData[name]
    if (envVars !== undefined) {
      environmentFound = true
      result = {
        ...result,
        ...envVars
      }
    }
  })

  if (!environmentFound) {
    const environmentError = new Error(
      `Failed to find environments [${environments.join(',')}] at .rc file location: ${absolutePath}`
    )
    environmentError.name = 'EnvironmentError'
    throw environmentError
  }

  return result
}
