/**
 * Gets the env vars from the rc file and rc environments
 */
export declare function getRCFileVars({ environments, filePath }: {
    environments: string[];
    filePath: string;
}): Promise<Record<string, any>>;
