import * as path from 'path'
import * as os from 'os'

/**
 * A simple function for resolving the path the user entered
 */
export function resolveEnvFilePath (userPath: string): string {
  // Make sure a home directory exist
  const home = os.homedir()
  if (home !== undefined) {
    userPath = userPath.replace(/^~($|\/|\\)/, `${home}$1`)
  }
  return path.resolve(process.cwd(), userPath)
}
/**
 * A simple function that parses a comma separated string into an array of strings
 */
export function parseArgList (list: string): string[] {
  return list.split(',')
}

/**
 * A simple function to test if the value is a promise
 */
export function isPromise (value: any | PromiseLike<Object>): value is Promise<any> {
  return value != null && typeof value.then === 'function'
}
