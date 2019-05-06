import { Command } from 'commander';
import { EnvCmdOptions } from './types';
/**
* Parses the arguments passed into the cli
*/
export declare function parseArgs(args: string[]): EnvCmdOptions;
export declare function parseArgsUsingCommander(args: string[]): Command;
