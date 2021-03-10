
/**
 * expandEnvs Replaces $var and ${var} in args and command with environment variables
 * the environment variable doesn't exist, it leaves it as is.
*/
export function expandEnvs (str: string, envs: { [key: string]: any }): string {
  return str.replace(/(?<!\\)\$\{?[a-zA-Z0-9_]+\}?/g, varName => {
    const varValue = envs[varName.startsWith('${') ? varName.substr(2, varName.length - 3) : varName.substr(1)]
    return varValue === undefined ? varName : varValue
  })
}
