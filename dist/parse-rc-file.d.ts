/**
 * Gets the env vars from the rc file and rc environments
 */
export declare function getRCFileVars({ environments, filePath }: {
    environments: string[];
    filePath: string;
}): Promise<{
    [key: string]: any;
}>;
/**
 * Reads and parses the .rc file
 */
export declare function parseRCFile(fileData: string): {
    [key: string]: any;
};
