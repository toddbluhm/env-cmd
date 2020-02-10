"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SIGNALS_TO_HANDLE = [
    'SIGINT', 'SIGTERM', 'SIGHUP'
];
class TermSignals {
    constructor(options = {}) {
        this.terminateSpawnedProcessFuncHandlers = {};
        this.verbose = false;
        this._exitCalled = false;
        this.verbose = options.verbose === true;
    }
    handleTermSignals(proc) {
        // Terminate child process if parent process receives termination events
        SIGNALS_TO_HANDLE.forEach((signal) => {
            this.terminateSpawnedProcessFuncHandlers[signal] =
                (signal, code) => {
                    this._removeProcessListeners();
                    if (!this._exitCalled) {
                        if (this.verbose) {
                            console.info('Parent process exited with signal: ' +
                                signal.toString() +
                                '. Terminating child process...');
                        }
                        // Mark shared state so we do not run into a signal/exit loop
                        this._exitCalled = true;
                        // Use the signal code if it is an error code
                        let correctSignal;
                        if (typeof signal === 'number') {
                            if (signal > ((code !== null && code !== void 0 ? code : 0))) {
                                code = signal;
                                correctSignal = 'SIGINT';
                            }
                        }
                        else {
                            correctSignal = signal;
                        }
                        // Kill the child process
                        proc.kill((correctSignal !== null && correctSignal !== void 0 ? correctSignal : code));
                        // Terminate the parent process
                        this._terminateProcess(code, correctSignal);
                    }
                };
            process.once(signal, this.terminateSpawnedProcessFuncHandlers[signal]);
        });
        process.once('exit', this.terminateSpawnedProcessFuncHandlers.SIGTERM);
        // Terminate parent process if child process receives termination events
        proc.on('exit', (code, signal) => {
            this._removeProcessListeners();
            if (!this._exitCalled) {
                if (this.verbose) {
                    console.info(`Child process exited with code: ${((code !== null && code !== void 0 ? code : '')).toString()} and signal:` +
                        ((signal !== null && signal !== void 0 ? signal : '')).toString() +
                        '. Terminating parent process...');
                }
                // Mark shared state so we do not run into a signal/exit loop
                this._exitCalled = true;
                // Use the signal code if it is an error code
                let correctSignal;
                if (typeof signal === 'number') {
                    if (signal > ((code !== null && code !== void 0 ? code : 0))) {
                        code = signal;
                        correctSignal = 'SIGINT';
                    }
                }
                else {
                    correctSignal = (signal !== null && signal !== void 0 ? signal : undefined);
                }
                // Terminate the parent process
                this._terminateProcess(code, correctSignal);
            }
        });
    }
    /**
     * Enables catching of unhandled exceptions
     */
    handleUncaughtExceptions() {
        process.on('uncaughtException', (e) => this._uncaughtExceptionHandler(e));
    }
    /**
     * Terminate parent process helper
     */
    _terminateProcess(code, signal) {
        if (signal !== undefined) {
            return process.kill(process.pid, signal);
        }
        if (code !== undefined) {
            return process.exit(code);
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
        process.removeListener('exit', this.terminateSpawnedProcessFuncHandlers.SIGTERM);
    }
    /**
    * General exception handler
    */
    _uncaughtExceptionHandler(e) {
        console.error(e.message);
        process.exit(1);
    }
}
exports.TermSignals = TermSignals;
