import type { GetEnvVarOptions, Environment } from './types.ts';
export declare function getEnvVars(options?: GetEnvVarOptions): Promise<Environment>;
export declare function getEnvFile({ filePath, fallback, verbose }: {
    filePath?: string;
    fallback?: boolean;
    verbose?: boolean;
}): Promise<Environment>;
export declare function getRCFile({ environments, filePath, verbose }: {
    environments: string[];
    filePath?: string;
    verbose?: boolean;
}): Promise<Environment>;
