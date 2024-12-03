import { ChildProcess } from 'child_process'

const SIGNALS_TO_HANDLE: NodeJS.Signals[] = [
  'SIGINT', 'SIGTERM', 'SIGHUP',
]

export class TermSignals {
  private readonly terminateSpawnedProcessFuncHandlers: Record<string, NodeJS.SignalsListener> = {}
  private terminateSpawnedProcessFuncExitHandler?: NodeJS.ExitListener
  private readonly verbose: boolean = false
  public _exitCalled = false

  constructor(options: { verbose?: boolean } = {}) {
    this.verbose = options.verbose === true
  }

  public handleTermSignals(proc: ChildProcess): void {
    // Terminate child process if parent process receives termination events
    const terminationFunc = (signal: NodeJS.Signals | number): void => {
      this._removeProcessListeners()
      if (!this._exitCalled) {
        if (this.verbose) {
          console.info(
            'Parent process exited with signal: '
            + signal.toString()
            + '. Terminating child process...')
        }
        // Mark shared state so we do not run into a signal/exit loop
        this._exitCalled = true
        // Use the signal code if it is an error code
        // let correctSignal: NodeJS.Signals | undefined
        if (typeof signal === 'number') {
          if (signal > 0) {
            // code = signal
            signal = 'SIGINT'
          }
        }
        // else {
        //   correctSignal = signal
        // }
        // Kill the child process
        proc.kill(signal)
        // Terminate the parent process
        this._terminateProcess(signal)
      }
    }

    for (const signal of SIGNALS_TO_HANDLE) {
      this.terminateSpawnedProcessFuncHandlers[signal] = terminationFunc
      process.once(signal, this.terminateSpawnedProcessFuncHandlers[signal])
    }
    this.terminateSpawnedProcessFuncExitHandler = terminationFunc
    process.once('exit', this.terminateSpawnedProcessFuncExitHandler)

    // Terminate parent process if child process receives termination events
    proc.on('exit', (code: number | undefined, signal: NodeJS.Signals | number | null): void => {
      this._removeProcessListeners()
      if (!this._exitCalled) {
        if (this.verbose) {
          console.info(
            `Child process exited with code: ${(code ?? '').toString()} and signal:`
            + (signal ?? '').toString()
            + '. Terminating parent process...',
          )
        }
        // Mark shared state so we do not run into a signal/exit loop
        this._exitCalled = true
        // Use the signal code if it is an error code
        let correctSignal: NodeJS.Signals | undefined
        if (typeof signal === 'number') {
          if (signal > (code ?? 0)) {
            code = signal
            correctSignal = 'SIGINT'
          }
        }
        else {
          correctSignal = signal ?? undefined
        }
        // Terminate the parent process
        this._terminateProcess(correctSignal ?? code)
      }
    })
  }

  /**
   * Enables catching of unhandled exceptions
   */
  public handleUncaughtExceptions(): void {
    process.on('uncaughtException', (e): void => {
      this._uncaughtExceptionHandler(e)
    })
  }

  /**
   * Terminate parent process helper
   */
  public _terminateProcess(signal?: NodeJS.Signals | number): void {
    if (signal != null) {
      if (typeof signal === 'string') {
        process.kill(process.pid, signal)
        return
      }
      if (typeof signal === 'number') {
        process.exit(signal)
        return
      }
    }
    throw new Error('Unable to terminate parent process successfully')
  }

  /**
   * Exit event listener clean up helper
   */
  public _removeProcessListeners(): void {
    SIGNALS_TO_HANDLE.forEach((signal): void => {
      process.removeListener(signal, this.terminateSpawnedProcessFuncHandlers[signal])
    })
    if (this.terminateSpawnedProcessFuncExitHandler != null) {
      process.removeListener('exit', this.terminateSpawnedProcessFuncExitHandler)
    }
  }

  /**
  * General exception handler
  */
  public _uncaughtExceptionHandler(e: Error): void {
    console.error(e.message)
    process.exit(1)
  }
}
