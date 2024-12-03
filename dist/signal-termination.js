const SIGNALS_TO_HANDLE = [
    'SIGINT', 'SIGTERM', 'SIGHUP',
];
export class TermSignals {
    terminateSpawnedProcessFuncHandlers = {};
    terminateSpawnedProcessFuncExitHandler;
    verbose = false;
    _exitCalled = false;
    constructor(options = {}) {
        this.verbose = options.verbose === true;
    }
    handleTermSignals(proc) {
        // Terminate child process if parent process receives termination events
        const terminationFunc = (signal) => {
            this._removeProcessListeners();
            if (!this._exitCalled) {
                if (this.verbose) {
                    console.info('Parent process exited with signal: '
                        + signal.toString()
                        + '. Terminating child process...');
                }
                // Mark shared state so we do not run into a signal/exit loop
                this._exitCalled = true;
                // Use the signal code if it is an error code
                // let correctSignal: NodeJS.Signals | undefined
                if (typeof signal === 'number') {
                    if (signal > 0) {
                        // code = signal
                        signal = 'SIGINT';
                    }
                }
                // else {
                //   correctSignal = signal
                // }
                // Kill the child process
                proc.kill(signal);
                // Terminate the parent process
                this._terminateProcess(signal);
            }
        };
        for (const signal of SIGNALS_TO_HANDLE) {
            this.terminateSpawnedProcessFuncHandlers[signal] = terminationFunc;
            process.once(signal, this.terminateSpawnedProcessFuncHandlers[signal]);
        }
        this.terminateSpawnedProcessFuncExitHandler = terminationFunc;
        process.once('exit', this.terminateSpawnedProcessFuncExitHandler);
        // Terminate parent process if child process receives termination events
        proc.on('exit', (code, signal) => {
            this._removeProcessListeners();
            if (!this._exitCalled) {
                if (this.verbose) {
                    console.info(`Child process exited with code: ${(code ?? '').toString()} and signal:`
                        + (signal ?? '').toString()
                        + '. Terminating parent process...');
                }
                // Mark shared state so we do not run into a signal/exit loop
                this._exitCalled = true;
                // Use the signal code if it is an error code
                let correctSignal;
                if (typeof signal === 'number') {
                    if (signal > (code ?? 0)) {
                        code = signal;
                        correctSignal = 'SIGINT';
                    }
                }
                else {
                    correctSignal = signal ?? undefined;
                }
                // Terminate the parent process
                this._terminateProcess(correctSignal ?? code);
            }
        });
    }
    /**
     * Enables catching of unhandled exceptions
     */
    handleUncaughtExceptions() {
        process.on('uncaughtException', (e) => {
            this._uncaughtExceptionHandler(e);
        });
    }
    /**
     * Terminate parent process helper
     */
    _terminateProcess(signal) {
        if (signal != null) {
            if (typeof signal === 'string') {
                process.kill(process.pid, signal);
                return;
            }
            if (typeof signal === 'number') {
                process.exit(signal);
                return;
            }
        }
        throw new Error('Unable to terminate parent process successfully');
    }
    /**
     * Exit event listener clean up helper
     */
    _removeProcessListeners() {
        SIGNALS_TO_HANDLE.forEach((signal) => {
            process.removeListener(signal, this.terminateSpawnedProcessFuncHandlers[signal]);
        });
        if (this.terminateSpawnedProcessFuncExitHandler != null) {
            process.removeListener('exit', this.terminateSpawnedProcessFuncExitHandler);
        }
    }
    /**
    * General exception handler
    */
    _uncaughtExceptionHandler(e) {
        console.error(e.message);
        process.exit(1);
    }
}
