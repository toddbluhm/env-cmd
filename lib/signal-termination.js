"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var SIGNALS_TO_HANDLE = [
    'SIGINT', 'SIGTERM', 'SIGHUP'
];
var terminateSpawnedProcessFuncHandlers = {};
var sharedState = {
    exitCalled: false
};
function handleTermSignals(proc) {
    // Handle a few special signals and then the general node exit event
    // on both parent and spawned process
    SIGNALS_TO_HANDLE.forEach(function (signal) {
        terminateSpawnedProcessFuncHandlers[signal] =
            function (signal, code) { return terminateSpawnedProc(proc, signal, sharedState, code); };
        process.once(signal, terminateSpawnedProcessFuncHandlers[signal]);
    });
    process.once('exit', terminateSpawnedProcessFuncHandlers['SIGTERM']);
    var terminateProcessFuncHandler = function (code, signal) { return terminateParentProcess(code, signal, sharedState); };
    proc.on('exit', terminateProcessFuncHandler);
}
exports.handleTermSignals = handleTermSignals;
/**
 * Helper for terminating the spawned process
 */
function terminateSpawnedProc(proc, signal, sharedState, code) {
    removeProcessListeners();
    if (!sharedState.exitCalled) {
        sharedState.exitCalled = true;
        proc.kill(signal);
    }
    if (code) {
        return process.exit(code);
    }
    process.kill(process.pid, signal);
}
exports.terminateSpawnedProc = terminateSpawnedProc;
/**
 * Helper for terminating the parent process
 */
function terminateParentProcess(code, signal, sharedState) {
    removeProcessListeners();
    if (!sharedState.exitCalled) {
        sharedState.exitCalled = true;
        if (signal) {
            return process.kill(process.pid, signal);
        }
        process.exit(code);
    }
}
exports.terminateParentProcess = terminateParentProcess;
/**
 * Helper for removing all termination signal listeners from parent process
 */
function removeProcessListeners() {
    SIGNALS_TO_HANDLE.forEach(function (signal) {
        process.removeListener(signal, terminateSpawnedProcessFuncHandlers[signal]);
    });
    process.removeListener('exit', terminateSpawnedProcessFuncHandlers['SIGTERM']);
}
exports.removeProcessListeners = removeProcessListeners;
/**
 * General exception handler
 */
function handleUncaughtExceptions(e) {
    if (e.message.match(/passed/gi)) {
        console.log(program.outputHelp());
    }
    console.log(e.message);
    process.exit(1);
}
exports.handleUncaughtExceptions = handleUncaughtExceptions;
process.on('uncaughtException', handleUncaughtExceptions);
