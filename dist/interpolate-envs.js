"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolateEnvs = void 0;
/**
 * interpolateEnvs Replaces {{var}} in args and command with environment variables
 * the environment variable doesn't exist, it leaves it as is.
*/
function interpolateEnvs(str, envs) {
    return str.replace(/(?<!\\){{[a-zA-Z0-9_]+}}/g, varName => {
        const varValue = envs[varName.replace(/{|}/g, '')];
        return varValue !== undefined ? varValue : varName;
    });
}
exports.interpolateEnvs = interpolateEnvs;
