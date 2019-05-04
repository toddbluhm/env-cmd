import { GetEnvVarOptions } from './types';
export declare function getEnvVars(options?: GetEnvVarOptions): Promise<{
    [key: string]: any;
}>;
export declare function getEnvFile({ filePath, fallback }: {
    filePath?: string;
    fallback?: boolean;
}): Promise<{
    [key: string]: any;
}>;
export declare function getRCFile({ environments, filePath }: {
    environments: string[];
    filePath?: string;
}): Promise<{
    [key: string]: any;
}>;
