/// <reference types="node" />
import { ChildProcess } from 'child_process';
export declare class TermSignals {
    private readonly terminateSpawnedProcessFuncHandlers;
    _exitCalled: boolean;
    handleTermSignals(proc: ChildProcess): void;
    /**
     * Enables catching of unhandled exceptions
     */
    handleUncaughtExceptions(): void;
    /**
     * Terminate parent process helper
     */
    _terminateProcess(code?: number, signal?: string): void;
    /**
     * Exit event listener clean up helper
     */
    _removeProcessListeners(): void;
    /**
    * General exception handler
    */
    _uncaughtExceptionHandler(e: Error): void;
}
