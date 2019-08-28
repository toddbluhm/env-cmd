import { GetEnvVarOptions } from './types'
import { getRCFileVars } from './parse-rc-file'
import { getEnvFileVars } from './parse-env-file'

const RC_FILE_DEFAULT_LOCATIONS = ['./.env-cmdrc', './.env-cmdrc.js', './.env-cmdrc.json']
const ENV_FILE_DEFAULT_LOCATIONS = ['./.env', './.env.js', './.env.json']

export async function getEnvVars (options: GetEnvVarOptions = {}): Promise<{ [key: string]: any }> {
  options.envFile = options.envFile !== undefined ? options.envFile : {}
  // Check for rc file usage
  if (options.rc !== undefined) {
    return getRCFile({ environments: options.rc.environments, filePath: options.rc.filePath })
  }
  return getEnvFile({ filePath: options.envFile.filePath, fallback: options.envFile.fallback })
}

export async function getEnvFile (
  { filePath, fallback }: { filePath?: string, fallback?: boolean }
): Promise<{ [key: string]: any }> {
  // Use env file
  if (filePath !== undefined) {
    try {
      return await getEnvFileVars(filePath)
    } catch (e) { }
    if (fallback !== true) {
      throw new Error(`Unable to locate env file at location (${filePath})`)
    }
  }

  // Use the default env file locations
  for (const path of ENV_FILE_DEFAULT_LOCATIONS) {
    try {
      return await getEnvFileVars(path)
    } catch (e) { }
  }

  throw new Error(`Unable to locate env file at default locations (${ENV_FILE_DEFAULT_LOCATIONS})`)
}

export async function getRCFile (
  { environments, filePath }: { environments: string[], filePath?: string }
): Promise<{ [key: string]: any }> {
  // User provided an .rc file path
  if (filePath !== undefined) {
    try {
      return await getRCFileVars({ environments, filePath })
    } catch (e) {
      if (e.name !== 'PathError') console.error(e)
      throw new Error(`Unable to locate .rc file at location (${filePath})`)
    }
  }

  // Use the default .rc file locations
  for (const filePath of RC_FILE_DEFAULT_LOCATIONS) {
    try {
      return await getRCFileVars({ environments, filePath })
    } catch (e) {
      if (e.name !== 'PathError') console.error(e)
    }
  }

  throw new Error(`Unable to locate .rc file at default locations (${RC_FILE_DEFAULT_LOCATIONS})`)
}
