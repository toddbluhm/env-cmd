/**
 * expandEnvs Replaces $var and ${var} in args and command with environment variables
 * the environment variable doesn't exist, it leaves it as is.
*/
export function expandEnvs(str, envs) {
    return str.replace(/(?<!\\)\$\{?[a-zA-Z0-9_]+\}?/g, (varName) => {
        const varValue = envs[varName.startsWith('${') ? varName.slice(2, varName.length - 1) : varName.slice(1)];
        return varValue ?? varName;
    });
}
