import { ChildProcess } from 'child_process';
export declare class TermSignals {
    private readonly terminateSpawnedProcessFuncHandlers;
    private terminateSpawnedProcessFuncExitHandler?;
    private readonly verbose;
    _exitCalled: boolean;
    constructor(options?: {
        verbose?: boolean;
    });
    handleTermSignals(proc: ChildProcess): void;
    /**
     * Enables catching of unhandled exceptions
     */
    handleUncaughtExceptions(): void;
    /**
     * Terminate parent process helper
     */
    _terminateProcess(signal?: NodeJS.Signals | number): void;
    /**
     * Exit event listener clean up helper
     */
    _removeProcessListeners(): void;
    /**
    * General exception handler
    */
    _uncaughtExceptionHandler(e: Error): void;
}
