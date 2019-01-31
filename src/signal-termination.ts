import { ChildProcess } from 'child_process' // eslint-disable-line
import * as program from 'commander'

const SIGNALS_TO_HANDLE: NodeJS.Signals[] = [
  'SIGINT', 'SIGTERM', 'SIGHUP'
]

const terminateSpawnedProcessFuncHandlers: {[key: string]: any } = {}
const sharedState = {
  exitCalled: false
}

export function handleTermSignals (proc: ChildProcess) {
  // Handle a few special signals and then the general node exit event
  // on both parent and spawned process
  SIGNALS_TO_HANDLE.forEach(signal => {
    terminateSpawnedProcessFuncHandlers[signal] =
      (signal: any, code: any) => terminateSpawnedProc(proc, signal, sharedState, code)
    process.once(signal, terminateSpawnedProcessFuncHandlers[signal])
  })
  process.once('exit', terminateSpawnedProcessFuncHandlers['SIGTERM'])

  const terminateProcessFuncHandler =
    (code: any, signal: any) => terminateParentProcess(code, signal, sharedState)
  proc.on('exit', terminateProcessFuncHandler)
}

/**
 * Helper for terminating the spawned process
 */
export function terminateSpawnedProc (
  proc: ChildProcess, signal: string, sharedState: any, code?: number
) {
  removeProcessListeners()

  if (!sharedState.exitCalled) {
    sharedState.exitCalled = true
    proc.kill(signal)
  }

  if (code) {
    return process.exit(code)
  }

  process.kill(process.pid, signal)
}

/**
 * Helper for terminating the parent process
 */
export function terminateParentProcess (code: number, signal: string, sharedState: any) {
  removeProcessListeners()

  if (!sharedState.exitCalled) {
    sharedState.exitCalled = true
    if (signal) {
      return process.kill(process.pid, signal)
    }
    process.exit(code)
  }
}

/**
 * Helper for removing all termination signal listeners from parent process
 */
export function removeProcessListeners () {
  SIGNALS_TO_HANDLE.forEach(signal => {
    process.removeListener(signal, terminateSpawnedProcessFuncHandlers[signal])
  })
  process.removeListener('exit', terminateSpawnedProcessFuncHandlers['SIGTERM'])
}

/**
 * General exception handler
 */
export function handleUncaughtExceptions (e: Error) {
  if (e.message.match(/passed/gi)) {
    console.log(program.outputHelp())
  }
  console.log(e.message)
  process.exit(1)
}

process.on('uncaughtException', handleUncaughtExceptions)
