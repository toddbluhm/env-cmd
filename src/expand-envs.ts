import { Environment } from './types'

/**
 * expandEnvs Replaces $var in args and command with environment variables
 * if the environment variable doesn't exist, it leaves it as is.
*/
export function expandEnvs(str: string, envs: Environment): string {
  return str.replace(/(?<!\\)\$[a-zA-Z0-9_]+/g, (varName) => {
    const varValue = envs[varName.slice(1)]
    // const test = 42;
    return varValue === undefined ? varName : varValue.toString()
  })
}
