import type { Command } from '@commander-js/extra-typings';
export type Environment = Partial<Record<string, string>>;
export type RCEnvironment = Partial<Record<string, Environment>>;
export type CommanderOptions = Command<[], {
    environments?: true | string[];
    expandEnvs?: boolean;
    recursive?: boolean;
    fallback?: boolean;
    file?: true | string;
    override?: boolean;
    silent?: boolean;
    useShell?: boolean;
    verbose?: boolean;
}>;
export interface RCFileOptions {
    environments: string[];
    filePath?: string;
}
export interface EnvFileOptions {
    filePath?: string;
    fallback?: boolean;
}
export interface GetEnvVarOptions {
    envFile?: EnvFileOptions;
    rc?: RCFileOptions;
    verbose?: boolean;
}
export interface EnvCmdOptions extends GetEnvVarOptions {
    command: string;
    commandArgs: string[];
    options?: {
        expandEnvs?: boolean;
        recursive?: boolean;
        noOverride?: boolean;
        silent?: boolean;
        useShell?: boolean;
        verbose?: boolean;
    };
}
