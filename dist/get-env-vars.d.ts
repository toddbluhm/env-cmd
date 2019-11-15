import { GetEnvVarOptions } from './types';
export declare function getEnvVars(options?: GetEnvVarOptions): Promise<{
    [key: string]: any;
}>;
export declare function getEnvFile({ filePath, fallback, verbose }: {
    filePath?: string;
    fallback?: boolean;
    verbose?: boolean;
}): Promise<{
    [key: string]: any;
}>;
export declare function getRCFile({ environments, filePath, verbose }: {
    environments: string[];
    filePath?: string;
    verbose?: boolean;
}): Promise<{
    [key: string]: any;
}>;
