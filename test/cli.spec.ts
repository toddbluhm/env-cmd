import { default as sinon } from 'sinon'
import { assert } from 'chai'
import { default as esmock } from 'esmock'
import type { CLI } from '../src/cli.ts'

describe('CLI', (): void => {
  let sandbox: sinon.SinonSandbox
  let parseArgsStub: sinon.SinonStub<any>
  let envCmdStub: sinon.SinonStub<any>
  let processExitStub: sinon.SinonStub<any>
  let cliLib: { CLI: typeof CLI }

  before(async (): Promise<void> => {
    sandbox = sinon.createSandbox()
    envCmdStub = sandbox.stub()
    parseArgsStub = sandbox.stub()
    processExitStub = sandbox.stub()
    cliLib = await esmock('../src/cli.ts', {
      '../src/env-cmd': {
        EnvCmd: envCmdStub,
      },
      '../src/parse-args': {
        parseArgs: parseArgsStub,
      },
      'node:process': {
        exit: processExitStub,
      },
    })
  })

  after((): void => {
    sandbox.restore()
  })

  afterEach((): void => {
    sandbox.resetHistory()
    sandbox.resetBehavior()
  })

  it('should parse the provided args and execute the EnvCmd', async (): Promise<void> => {
    parseArgsStub.returns({})
    await cliLib.CLI(['node', './env-cmd', '-v'])
    assert.equal(parseArgsStub.callCount, 1)
    assert.equal(envCmdStub.callCount, 1)
    assert.equal(processExitStub.callCount, 0)
  })

  it('should catch exception if EnvCmd throws an exception', async (): Promise<void> => {
    parseArgsStub.returns({})
    envCmdStub.throwsException('Error')
    await cliLib.CLI(['node', './env-cmd', '-v'])
    assert.equal(parseArgsStub.callCount, 1)
    assert.equal(envCmdStub.callCount, 1)
    assert.equal(processExitStub.callCount, 1)
    assert.equal(processExitStub.args[0][0], 1)
  })
})
