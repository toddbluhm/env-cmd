"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SIGNALS_TO_HANDLE = [
    'SIGINT', 'SIGTERM', 'SIGHUP'
];
class TermSignals {
    constructor() {
        this.terminateSpawnedProcessFuncHandlers = {};
        this._exitCalled = false;
    }
    handleTermSignals(proc) {
        // Terminate child process if parent process receives termination events
        SIGNALS_TO_HANDLE.forEach((signal) => {
            this.terminateSpawnedProcessFuncHandlers[signal] =
                (signal, code) => {
                    this._removeProcessListeners();
                    if (!this._exitCalled) {
                        this._exitCalled = true;
                        proc.kill(signal);
                        this._terminateProcess(code, signal);
                    }
                };
            process.once(signal, this.terminateSpawnedProcessFuncHandlers[signal]);
        });
        process.once('exit', this.terminateSpawnedProcessFuncHandlers.SIGTERM);
        // Terminate parent process if child process receives termination events
        proc.on('exit', (code, signal) => {
            this._removeProcessListeners();
            const convertedSignal = signal != null ? signal : undefined;
            if (!this._exitCalled) {
                this._exitCalled = true;
                this._terminateProcess(code, convertedSignal);
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
