import type { EnvCmdOptions, CommanderOptions } from './types.ts';
/**
* Parses the arguments passed into the cli
*/
export declare function parseArgs(args: string[]): EnvCmdOptions;
export declare function parseArgsUsingCommander(args: string[]): CommanderOptions;
