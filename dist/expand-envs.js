/**
 * expandEnvs Replaces $var and ${var} in args and command with environment variables
 * if the environment variable doesn't exist, it leaves it as is.
*/
export function expandEnvs(str, envs) {
    return str.replace(/(?<!\\)\$(\{\w+\}|\w+)?/g, (varName) => {
        const varValue = envs[varName.startsWith('${') ? varName.slice(2, varName.length - 1) : varName.slice(1)];
        return varValue ?? varName;
    });
}
