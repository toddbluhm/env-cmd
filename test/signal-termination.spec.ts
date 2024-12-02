import { assert } from 'chai'
import { default as sinon } from 'sinon'
import { TermSignals } from '../src/signal-termination.js'
import { ChildProcess } from 'child_process'

type ChildExitListener = (code: number | null, signal: NodeJS.Signals | null | number) => void

describe('signal-termination', (): void => {
  let sandbox: sinon.SinonSandbox
  before(() => {
    sandbox = sinon.createSandbox()
  })

  after(() => {
    sandbox.restore()
  })

  describe('TermSignals', (): void => {
    describe('_uncaughtExceptionHandler', (): void => {
      const term = new TermSignals()
      let logStub: sinon.SinonStub<any>
      let processStub: sinon.SinonStub<any>

      beforeEach((): void => {
        logStub = sandbox.stub(console, 'error')
        processStub = sandbox.stub(process, 'exit')
      })

      afterEach((): void => {
        sandbox.restore()
      })

      it('should print the error message and exit the process with error code 1 ', (): void => {
        term._uncaughtExceptionHandler(new Error('message'))
        assert.equal(logStub.callCount, 1)
        assert.equal(logStub.args[0][0], 'message')
        assert.equal(processStub.callCount, 1)
        assert.equal(processStub.args[0][0], 1)
        logStub.restore() // restore here so test success logs get printed
      })
    })

    describe('_removeProcessListeners', (): void => {
      const term = new TermSignals()
      let removeListenerStub: sinon.SinonStub<any>
      before((): void => {
        removeListenerStub = sandbox.stub(process, 'removeListener')
      })

      after((): void => {
        sandbox.restore()
      })

      it('should remove all listeners from default signals and exit signal', (): void => {
        term._removeProcessListeners()
        assert.equal(removeListenerStub.callCount, 3)
        assert.oneOf(removeListenerStub.args[2][0], ['SIGTERM', 'SIGINT', 'SIGHUP'])
      })
    })

    describe('_terminateProcess', (): void => {
      const term = new TermSignals()
      let exitStub: sinon.SinonStub<any>
      let killStub: sinon.SinonStub<any>

      beforeEach((): void => {
        exitStub = sandbox.stub(process, 'exit')
        killStub = sandbox.stub(process, 'kill')
      })

      afterEach((): void => {
        sandbox.restore()
      })

      it('should call exit method on parent process if no signal provided', (): void => {
        term._terminateProcess(0)
        // We here test code that in reality is unreachable.
        assert.equal(exitStub.callCount, 1)
      })

      it('should call exit method with correct error code', (): void => {
        term._terminateProcess(3)
        assert.equal(killStub.callCount, 0)
        assert.equal(exitStub.callCount, 1)
        assert.equal(exitStub.args[0][0], 3)
      })

      it('should call kill method with correct kill signal', (): void => {
        term._terminateProcess('SIGINT')
        assert.equal(killStub.callCount, 1)
        assert.equal(exitStub.callCount, 0)
        assert.equal(killStub.args[0][1], 'SIGINT')
      })

      it('should throw error if code and signal are missing', (): void => {
        try {
          term._terminateProcess()
          assert.fail('should not get here')
        }
        catch (e) {
          assert.instanceOf(e, Error)
          assert.match(e.message, /unable to terminate parent process/gi)
        }
      })
    })

    describe('handleUncaughtExceptions', (): void => {
      const term = new TermSignals()
      let processOnStub: sinon.SinonStub<any>
      let _uncaughtExceptionHandlerStub: sinon.SinonStub<any>

      before((): void => {
        processOnStub = sandbox.stub(process, 'on')
        _uncaughtExceptionHandlerStub = sandbox.stub(term, '_uncaughtExceptionHandler')
      })

      after((): void => {
        sandbox.restore()
      })

      it('attach handler to the process `uncaughtException` event', (): void => {
        term.handleUncaughtExceptions()
        assert.equal(processOnStub.callCount, 1)
        assert.equal(_uncaughtExceptionHandlerStub.callCount, 0)
        ;(processOnStub.args[0][1] as () => void)()
        assert.equal(_uncaughtExceptionHandlerStub.callCount, 1)
      })
    })

    describe('handleTermSignals', (): void => {
      let term: TermSignals
      let procKillStub: sinon.SinonStub<any>
      let procOnStub: sinon.SinonStub<any>
      let processOnceStub: sinon.SinonStub<any>
      let _removeProcessListenersStub: sinon.SinonStub<any>
      let _terminateProcessStub: sinon.SinonStub<any>
      let logInfoStub: sinon.SinonStub<any>
      let proc: ChildProcess

      function setup(verbose = false): void {
        term = new TermSignals({ verbose })
        procKillStub = sandbox.stub()
        procOnStub = sandbox.stub()
        processOnceStub = sandbox.stub(process, 'once')
        _removeProcessListenersStub = sandbox.stub(term, '_removeProcessListeners')
        _terminateProcessStub = sandbox.stub(term, '_terminateProcess')
        proc = {
          kill: procKillStub,
          on: procOnStub,
        } as unknown as ChildProcess
      }

      beforeEach((): void => {
        setup()
      })

      afterEach((): void => {
        sandbox.restore()
      })

      it('should setup 4 listeners for the parent process and 1 listen for the child process', (): void => {
        term.handleTermSignals(proc)
        assert.equal(processOnceStub.callCount, 4)
        assert.equal(procOnStub.callCount, 1)
        assert.notOk(term._exitCalled)
      })

      it('should terminate child process if parent process terminated', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(processOnceStub.args[0][1] as NodeJS.SignalsListener)('SIGTERM')
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(procKillStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should print child process terminated to info for verbose', (): void => {
        sandbox.restore()
        setup(true)
        logInfoStub = sandbox.stub(console, 'info')
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(processOnceStub.args[0][1] as NodeJS.SignalsListener)('SIGTERM')
        assert.equal(logInfoStub.callCount, 1)
      })

      it('should not terminate child process if child process termination '
        + 'has already been called by parent', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(processOnceStub.args[0][1] as NodeJS.SignalsListener)('SIGINT')
        assert.isOk(term._exitCalled)
        ;(processOnceStub.args[0][1] as NodeJS.SignalsListener)('SIGTERM')
        assert.equal(_removeProcessListenersStub.callCount, 2)
        assert.equal(procKillStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should convert and use number signal as code', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(processOnceStub.args[0][1] as NodeJS.ExitListener)(1)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(procKillStub.callCount, 1)
        assert.equal(procKillStub.args[0][0], 'SIGINT')
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should not use default signal if code is 0', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(processOnceStub.args[0][1] as NodeJS.ExitListener)(0)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(procKillStub.callCount, 1)
        assert.equal(procKillStub.args[0], 0)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should use signal value and default SIGINT signal if code is undefined', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(processOnceStub.args[0][1] as NodeJS.ExitListener)(4)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(procKillStub.callCount, 1)
        assert.equal(procKillStub.args[0][0], 'SIGINT')
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should terminate parent process if child process terminated', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(procOnStub.args[0][1] as ChildExitListener)(1, 'SIGTERM')
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should print parent process terminated to info for verbose', (): void => {
        sandbox.restore()
        setup(true)
        logInfoStub = sandbox.stub(console, 'info')
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(procOnStub.args[0][1] as ChildExitListener)(1, 'SIGTERM')
        assert.equal(logInfoStub.callCount, 1)
      })

      it(
        'should print parent process terminated to info for verbose when '
        + 'code and signal are undefined',
        (): void => {
          sandbox.restore()
          setup(true)
          logInfoStub = sandbox.stub(console, 'info')
          assert.notOk(term._exitCalled)
          term.handleTermSignals(proc)
          ;(procOnStub.args[0][1] as ChildExitListener)(null, null)
          assert.equal(logInfoStub.callCount, 1)
        },
      )

      it('should not terminate parent process if parent process already terminating', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(procOnStub.args[0][1] as ChildExitListener)(1, 'SIGINT')
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        ;(procOnStub.args[0][1] as ChildExitListener)(1, 'SIGTERM')
        assert.equal(_removeProcessListenersStub.callCount, 2)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should convert null signal value to undefined', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(procOnStub.args[0][1] as ChildExitListener)(0, null)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.strictEqual(_terminateProcessStub.firstCall.args[1], undefined)
        assert.isOk(term._exitCalled)
      })

      it('should convert and use number signal as code', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(procOnStub.args[0][1] as ChildExitListener)(1, 4)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.strictEqual(_terminateProcessStub.firstCall.args[0], 'SIGINT')
        assert.isOk(term._exitCalled)
      })

      it('should not use signal number as code if value is 0', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(procOnStub.args[0][1] as ChildExitListener)(1, 0)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.strictEqual(_terminateProcessStub.firstCall.args[0], 1)
        assert.isOk(term._exitCalled)
      })

      it('should use signal value and default SIGINT signal if code is undefined', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        ;(procOnStub.args[0][1] as ChildExitListener)(null, 1)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.strictEqual(_terminateProcessStub.firstCall.args[0], 'SIGINT')
        assert.isOk(term._exitCalled)
      })
    })
  })
})
