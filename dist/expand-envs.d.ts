/**
 * expandEnvs Replaces $var in args and command with environment variables
 * the environment variable doesn't exist, it leaves it as is.
*/
export declare function expandEnvs(str: string, envs: {
    [key: string]: any;
}): string;
