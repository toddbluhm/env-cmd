import { assert } from 'chai'
import * as sinon from 'sinon'
import { TermSignals } from '../src/signal-termination'

describe('signal-termination', (): void => {
  describe('TermSignals', (): void => {
    describe('_uncaughtExceptionHandler', (): void => {
      const term = new TermSignals()
      let logStub: sinon.SinonStub<any, any>
      let processStub: sinon.SinonStub<any, any>
      beforeEach((): void => {
        logStub = sinon.stub(console, 'error')
        processStub = sinon.stub(process, 'exit')
      })

      afterEach((): void => {
        sinon.restore()
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
      let removeListenerStub: sinon.SinonStub<any, any>
      before((): void => {
        removeListenerStub = sinon.stub(process, 'removeListener')
      })

      after((): void => {
        sinon.restore()
      })

      it('should remove all listeners from default signals and exit signal', (): void => {
        term._removeProcessListeners()
        assert.equal(removeListenerStub.callCount, 4)
        assert.equal(removeListenerStub.args[3][0], 'exit')
      })
    })

    describe('_terminateProcess', (): void => {
      const term = new TermSignals()
      let exitStub: sinon.SinonStub<any, any>
      let killStub: sinon.SinonStub<any, any>

      beforeEach((): void => {
        exitStub = sinon.stub(process, 'exit')
        killStub = sinon.stub(process, 'kill')
      })

      afterEach((): void => {
        sinon.restore()
      })

      it('should call exit method on parent process if no signal provided', (): void => {
        term._terminateProcess(0)
        assert.equal(exitStub.callCount, 1)
      })

      it('should call exit method with correct error code', (): void => {
        term._terminateProcess(3)
        assert.equal(killStub.callCount, 0)
        assert.equal(exitStub.callCount, 1)
        assert.equal(exitStub.args[0][0], 3)
      })

      it('should call kill method with correct kill signal', (): void => {
        term._terminateProcess(1, 'SIGINT')
        assert.equal(killStub.callCount, 1)
        assert.equal(exitStub.callCount, 0)
        assert.equal(killStub.args[0][1], 'SIGINT')
      })

      it('should throw error if code and signal are missing', (): void => {
        try {
          term._terminateProcess()
          assert.fail('should not get here')
        } catch (e) {
          assert.match(e.message, /unable to terminate parent process/gi)
        }
      })
    })

    describe('handleUncaughtExceptions', (): void => {
      const term = new TermSignals()
      let processOnStub: sinon.SinonStub<any, any>
      let _uncaughtExceptionHandlerStub: sinon.SinonStub<any, any>

      before((): void => {
        processOnStub = sinon.stub(process, 'on')
        _uncaughtExceptionHandlerStub = sinon.stub(term, '_uncaughtExceptionHandler')
      })

      after((): void => {
        sinon.restore()
      })

      it('attach handler to the process `uncaughtException` event', (): void => {
        term.handleUncaughtExceptions()
        assert.equal(processOnStub.callCount, 1)
        assert.equal(_uncaughtExceptionHandlerStub.callCount, 0)
        processOnStub.args[0][1]()
        assert.equal(_uncaughtExceptionHandlerStub.callCount, 1)
      })
    })

    describe('handleTermSignals', (): void => {
      let term: TermSignals
      let procKillStub: sinon.SinonStub<any, any>
      let procOnStub: sinon.SinonStub<any, any>
      let processOnceStub: sinon.SinonStub<any, any>
      let _removeProcessListenersStub: sinon.SinonStub<any, any>
      let _terminateProcessStub: sinon.SinonStub<any, any>
      let proc: any
      beforeEach((): void => {
        term = new TermSignals()
        procKillStub = sinon.stub()
        procOnStub = sinon.stub()
        processOnceStub = sinon.stub(process, 'once')
        _removeProcessListenersStub = sinon.stub(term, '_removeProcessListeners')
        _terminateProcessStub = sinon.stub(term, '_terminateProcess')
        proc = {
          kill: procKillStub,
          on: procOnStub
        }
      })

      afterEach((): void => {
        sinon.restore()
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
        processOnceStub.args[0][1]('SIGTERM', 1)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(procKillStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should not terminate child process if child process termination ' +
        'has already been called by parent', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        processOnceStub.args[0][1]('SIGINT', 1)
        assert.isOk(term._exitCalled)
        processOnceStub.args[0][1]('SIGTERM', 1)
        assert.equal(_removeProcessListenersStub.callCount, 2)
        assert.equal(procKillStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      }
      )

      it('should terminate parent process if child process terminated', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        procOnStub.args[0][1](1, 'SIGTERM')
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should not terminate parent process if parent process already terminating', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        procOnStub.args[0][1](1, 'SIGINT')
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        procOnStub.args[0][1](1, 'SIGTERM')
        assert.equal(_removeProcessListenersStub.callCount, 2)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.isOk(term._exitCalled)
      })

      it('should convert null signal value to undefined', (): void => {
        assert.notOk(term._exitCalled)
        term.handleTermSignals(proc)
        procOnStub.args[0][1](0, null)
        assert.equal(_removeProcessListenersStub.callCount, 1)
        assert.equal(_terminateProcessStub.callCount, 1)
        assert.strictEqual(_terminateProcessStub.firstCall.args[1], undefined)
        assert.isOk(term._exitCalled)
      })
    })
  })
})
