import { GetEnvVarOptions } from './types';
export declare function getEnvVars(options?: GetEnvVarOptions): Promise<Record<string, any>>;
export declare function getEnvFile({ filePath, fallback, verbose }: {
    filePath?: string;
    fallback?: boolean;
    verbose?: boolean;
}): Promise<Record<string, any>>;
export declare function getRCFile({ environments, filePath, verbose }: {
    environments: string[];
    filePath?: string;
    verbose?: boolean;
}): Promise<Record<string, any>>;
