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
    const pathError = new Error('Invalid .rc file path.')
    pathError.name = 'PathError'
    throw pathError
  }

  // Get the file extension
  const ext = extname(absolutePath).toLowerCase()
  let parsedData: { [key: string]: any }
  if (ext === '.json' || ext === '.js') {
    const possiblePromise = require(absolutePath) /* eslint-disable-line */
    parsedData = isPromise(possiblePromise) ? await possiblePromise : possiblePromise
  } else {
    const file = await readFileAsync(absolutePath, { encoding: 'utf8' })
    parsedData = parseRCFile(file)
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
    console.error(`Error:
  Could not find any environments:
    ${environments}
  in .rc file:
    ${absolutePath}`)
    throw new Error(`All environments (${environments}) are missing in in .rc file (${absolutePath}).`)
  }

  return result
}

/**
 * Reads and parses the .rc file
 */
export function parseRCFile (fileData: string): { [key: string]: any } {
  let data
  try {
    data = JSON.parse(fileData)
  } catch (e) {
    console.error(`Error:
  Failed to parse the .rc file.
  Please make sure its a valid JSON format.`)
    throw new Error('Unable to parse JSON in .rc file.')
  }
  return data
}
