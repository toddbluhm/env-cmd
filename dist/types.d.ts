export interface GetEnvVarOptions {
    envFile?: {
        filePath?: string;
        fallback?: boolean;
    };
    rc?: {
        environments: string[];
        filePath?: string;
    };
    verbose?: boolean;
}
export interface EnvCmdOptions extends Pick<GetEnvVarOptions, 'envFile' | 'rc'> {
    command: string;
    commandArgs: string[];
    options?: {
        expandEnvs?: boolean;
        noOverride?: boolean;
        silent?: boolean;
        useShell?: boolean;
        verbose?: boolean;
    };
}
