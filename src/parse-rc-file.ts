import * as fs from 'fs'
import { resolveEnvFilePath } from './utils'

/**
 * Uses the rc file and rc environment to get env vars
 */
export function useRCFile (
  { environments, path }:
  { environments: string[], path: string }
): { [key: string]: any } {
  const absolutePath = resolveEnvFilePath(path)
  console.log(absolutePath)
  if (!fs.existsSync(absolutePath)) {
    throw new Error('Invalid .rc file path.')
  }
  const fileData = fs.readFileSync(absolutePath, { encoding: 'utf8' })
  const parsedData = parseRCFile(fileData)

  if (environments.length === 1 && !parsedData[environments[0]]) {
    console.error(`Error:
  Could not find environment:
    ${environments[0]}
  in .rc file:
    ${absolutePath}`)
    throw new Error(`Missing environment ${environments[0]} in .env-cmdrc file.`)
  }

  // Parse and merge multiple rc environments together
  let result = {}
  let environmentFound = false
  environments.forEach(name => {
    const envVars = parsedData[name]
    if (envVars) {
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
 * Reads and parses the .env-cmdrc file
 */
export function parseRCFile (fileData: string): { [key: string]: any } {
  let data
  try {
    data = JSON.parse(fileData)
  } catch (e) {
    console.error(`Error:
  Could not parse the .env-cmdrc file.
  Please make sure its in a valid JSON format.`)
    throw new Error(`Unable to parse JSON in .env-cmdrc file.`)
  }
  return data
}
