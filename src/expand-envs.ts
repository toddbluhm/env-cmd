
/**
 * expandEnvs Replaces $var in args and command with environment variables
 * the environment variable doesn't exist, it leaves it as is.
*/
export function expandEnvs (str: string, envs: { [key: string]: any }): string {
  return str.replace(/(?<!\\)\$\{?([a-zA-Z0-9_]+)\}?/g, (_, varName: string) => {
    const varValue = envs[varName]
    return varValue === undefined ? `$${varName}` : varValue
  })
}
