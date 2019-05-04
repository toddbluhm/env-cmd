export interface GetEnvVarOptions {
    envFile?: {
        filePath?: string;
        fallback?: boolean;
    };
    rc?: {
        environments: string[];
        filePath?: string;
    };
}
export interface EnvCmdOptions extends GetEnvVarOptions {
    command: string;
    commandArgs: string[];
    options?: {
        noOverride?: boolean;
        useShell?: boolean;
    };
}
