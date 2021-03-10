"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandEnvs = void 0;
/**
 * expandEnvs Replaces $var and ${var} in args and command with environment variables
 * the environment variable doesn't exist, it leaves it as is.
*/
function expandEnvs(str, envs) {
    return str.replace(/(?<!\\)\$\{?[a-zA-Z0-9_]+\}?/g, varName => {
        const varValue = envs[varName.startsWith('${') ? varName.substr(2, varName.length - 3) : varName.substr(1)];
        return varValue === undefined ? varName : varValue;
    });
}
exports.expandEnvs = expandEnvs;
