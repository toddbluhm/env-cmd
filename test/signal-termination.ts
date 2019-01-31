
import * as assert from 'better-assert'
import * as sinon from 'sinon'
import {
  handleUncaughtExceptions, terminateSpawnedProc, terminateParentProcess
} from '../src/signal-termination'

describe('signal-termination', () => {
  describe('handleUncaughtExceptions', function () {
    beforeEach(function () {
      this.logStub = sinon.stub(console, 'log')
      this.processStub = sinon.stub(process, 'exit')
    })
    afterEach(function () {
      this.logStub.restore()
      this.processStub.restore()
    })
    it('should print help text and error if error contains \'passed\'', function () {
      handleUncaughtExceptions(new Error('print help text passed now'))
      assert(this.logStub.calledTwice)
      this.logStub.restore() // restore here so test success logs get printed
    })

    it('should print just there error if error does not contain \'passed\'', function () {
      handleUncaughtExceptions(new Error('do not print help text now'))
      assert(this.logStub.calledOnce)
      this.logStub.restore() // restore here so test success logs get printed
    })
  })

  describe('terminateSpawnedProc', function () {
    beforeEach(function () {
      this.procStub = sinon.stub()
      this.exitStub = sinon.stub(process, 'exit')
      this.killStub = sinon.stub(process, 'kill')
      this.proc = {
        kill: this.procStub
      }
      this.exitCalled = false
    })

    afterEach(function () {
      this.exitStub.restore()
      this.killStub.restore()
    })

    it('should call kill method on spawned process', function () {
      terminateSpawnedProc.call(this, this.proc)
      assert(this.procStub.callCount === 1)
    })

    it('should not call kill method more than once', function () {
      terminateSpawnedProc.call(this, this.proc)
      terminateSpawnedProc.call(this, this.proc)
      assert(this.procStub.callCount === 1)
    })

    it('should not call kill method if the spawn process is already dying', function () {
      this.exitCalled = true
      terminateSpawnedProc.call(this, this.proc)
      assert(this.procStub.callCount === 0)
    })

    it('should call kill method on spawned process with correct signal', function () {
      terminateSpawnedProc.call(this, this.proc, 'SIGINT')
      assert(this.procStub.callCount === 1)
      assert(this.procStub.args[0][0] === 'SIGINT')
    })

    it('should call kill method on parent process with correct signal', function () {
      terminateSpawnedProc.call(this, this.proc, 'SIGINT')
      assert(this.exitStub.callCount === 0)
      assert(this.killStub.callCount === 1)
      assert(this.killStub.args[0][1] === 'SIGINT')
    })

    it('should call exit method on parent process with correct exit code', function () {
      terminateSpawnedProc.call(this, this.proc, 'SIGINT', 1)
      assert(this.killStub.callCount === 0)
      assert(this.exitStub.callCount === 1)
      assert(this.exitStub.args[0][0] === 1)
    })
  })

  describe('terminateParentProcess', function () {
    beforeEach(function () {
      this.exitStub = sinon.stub(process, 'exit')
      this.killStub = sinon.stub(process, 'kill')
      this.exitCalled = false
    })

    afterEach(function () {
      this.exitStub.restore()
      this.killStub.restore()
    })

    it('should call exit method on parent process', function () {
      terminateParentProcess.call(this)
      assert(this.exitStub.callCount === 1)
    })

    it('should not call exit method more than once', function () {
      terminateParentProcess.call(this)
      terminateParentProcess.call(this)
      assert(this.exitStub.callCount === 1)
    })

    it('should not call exit method if the process is already dying', function () {
      this.exitCalled = true
      terminateParentProcess.call(this)
      assert(this.exitStub.callCount === 0)
    })

    it('should call exit method with correct error code', function () {
      terminateParentProcess.call(this, 0)
      assert(this.killStub.callCount === 0)
      assert(this.exitStub.callCount === 1)
      assert(this.exitStub.args[0][0] === 0)
    })

    it('should call kill method with correct kill signal', function () {
      terminateParentProcess.call(this, null, 'SIGINT')
      assert(this.killStub.callCount === 1)
      assert(this.exitStub.callCount === 0)
      assert(this.killStub.args[0][1] === 'SIGINT')
    })
  })
})
