import type { Environment } from './types.ts';
/**
 * Executes env - cmd using command line arguments
 * @export
 * @param {string[]} args Command line argument to pass in ['-f', './.env']
 * @returns {Promise<Environment>}
 */
export declare function CLI(args: string[]): Promise<Environment>;
