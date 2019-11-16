import { ChildProcess } from 'child_process' // eslint-disable-line

const SIGNALS_TO_HANDLE: NodeJS.Signals[] = [
  'SIGINT', 'SIGTERM', 'SIGHUP'
]

export class TermSignals {
  private readonly terminateSpawnedProcessFuncHandlers: { [key: string]: any } = {}
  private readonly verbose: boolean = false;
  public _exitCalled = false

  constructor (options: { verbose?: boolean } = {}) {
    this.verbose = options.verbose === true
  }

  public handleTermSignals (proc: ChildProcess): void {
    // Terminate child process if parent process receives termination events
    SIGNALS_TO_HANDLE.forEach((signal): void => {
      this.terminateSpawnedProcessFuncHandlers[signal] =
        (signal: any, code: any): void => {
          this._removeProcessListeners()
          if (!this._exitCalled) {
            if (this.verbose === true) {
              console.info(`Parent process exited with signal: ${signal}. Terminating child process...`)
            }
            this._exitCalled = true
            proc.kill(signal)
            this._terminateProcess(code, signal)
          }
        }
      process.once(signal, this.terminateSpawnedProcessFuncHandlers[signal])
    })
    process.once('exit', this.terminateSpawnedProcessFuncHandlers.SIGTERM)

    // Terminate parent process if child process receives termination events
    proc.on('exit', (code: number | undefined, signal: string | null): void => {
      this._removeProcessListeners()
      const convertedSignal = signal != null ? signal : undefined
      if (!this._exitCalled) {
        if (this.verbose === true) {
          console.info(
            `Child process exited with code: ${code} and signal: ${signal}. ` +
            'Terminating parent process...'
          )
        }
        this._exitCalled = true
        this._terminateProcess(code, convertedSignal)
      }
    })
  }

  /**
   * Enables catching of unhandled exceptions
   */
  public handleUncaughtExceptions (): void {
    process.on('uncaughtException', (e): void => this._uncaughtExceptionHandler(e))
  }

  /**
   * Terminate parent process helper
   */
  public _terminateProcess (code?: number, signal?: string): void {
    if (signal !== undefined) {
      return process.kill(process.pid, signal)
    }
    if (code !== undefined) {
      return process.exit(code)
    }
    throw new Error('Unable to terminate parent process successfully')
  }

  /**
   * Exit event listener clean up helper
   */
  public _removeProcessListeners (): void {
    SIGNALS_TO_HANDLE.forEach((signal): void => {
      process.removeListener(signal, this.terminateSpawnedProcessFuncHandlers[signal])
    })
    process.removeListener('exit', this.terminateSpawnedProcessFuncHandlers.SIGTERM)
  }

  /**
  * General exception handler
  */
  public _uncaughtExceptionHandler (e: Error): void {
    console.error(e.message)
    process.exit(1)
  }
}
