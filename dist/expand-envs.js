"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * expandEnvs Replaces $var in args and command with environment variables
 * the environment variable doesn't exist, it leaves it as is.
*/
function expandEnvs(str, envs) {
    return str.replace(/(?<!\\)\$[a-zA-Z0-9_]+/g, varName => {
        const varValue = envs[varName.slice(1)];
        return varValue === undefined ? varName : varValue;
    });
}
exports.expandEnvs = expandEnvs;
