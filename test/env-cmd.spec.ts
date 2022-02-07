import * as sinon from 'sinon'
import { assert } from 'chai'
import * as signalTermLib from '../src/signal-termination'
import * as parseArgsLib from '../src/parse-args'
import * as getEnvVarsLib from '../src/get-env-vars'
import * as expandEnvsLib from '../src/expand-envs'
import * as interpolateEnvsLib from '../src/interpolate-envs';
import * as spawnLib from '../src/spawn'
import * as envCmdLib from '../src/env-cmd'

describe('CLI', (): void => {
  let sandbox: sinon.SinonSandbox
  let parseArgsStub: sinon.SinonStub<any, any>
  let envCmdStub: sinon.SinonStub<any, any>
  let processExitStub: sinon.SinonStub<any, any>
  before((): void => {
    sandbox = sinon.createSandbox()
    parseArgsStub = sandbox.stub(parseArgsLib, 'parseArgs')
    envCmdStub = sandbox.stub(envCmdLib, 'EnvCmd')
    processExitStub = sandbox.stub(process, 'exit')
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
    await envCmdLib.CLI(['node', './env-cmd', '-v'])
    assert.equal(parseArgsStub.callCount, 1)
    assert.equal(envCmdStub.callCount, 1)
    assert.equal(processExitStub.callCount, 0)
  })

  it('should catch exception if EnvCmd throws an exception', async (): Promise<void> => {
    parseArgsStub.returns({})
    envCmdStub.throwsException('Error')
    await envCmdLib.CLI(['node', './env-cmd', '-v'])
    assert.equal(parseArgsStub.callCount, 1)
    assert.equal(envCmdStub.callCount, 1)
    assert.equal(processExitStub.callCount, 1)
    assert.equal(processExitStub.args[0][0], 1)
  })
})

describe('EnvCmd', (): void => {
  let sandbox: sinon.SinonSandbox
  let getEnvVarsStub: sinon.SinonStub<any, any>
  let spawnStub: sinon.SinonStub<any, any>
  let expandEnvsSpy: sinon.SinonSpy<any, any>
  let interpolateEnvsSpy: sinon.SinonSpy<any, any>
  before((): void => {
    sandbox = sinon.createSandbox()
    getEnvVarsStub = sandbox.stub(getEnvVarsLib, 'getEnvVars')
    spawnStub = sandbox.stub(spawnLib, 'spawn')
    spawnStub.returns({
      on: (): void => { /* Fake the on method */ },
      kill: (): void => { /* Fake the kill method */ }
    })
    expandEnvsSpy = sandbox.spy(expandEnvsLib, 'expandEnvs')
    interpolateEnvsSpy = sandbox.spy(interpolateEnvsLib, 'interpolateEnvs')
    sandbox.stub(signalTermLib.TermSignals.prototype, 'handleTermSignals')
    sandbox.stub(signalTermLib.TermSignals.prototype, 'handleUncaughtExceptions')
  })

  after((): void => {
    sandbox.restore()
  })

  afterEach((): void => {
    sandbox.resetHistory()
  })

  it('should parse the provided args and execute the EnvCmd', async (): Promise<void> => {
    getEnvVarsStub.returns({ BOB: 'test' })
    await envCmdLib.EnvCmd({
      command: 'node',
      commandArgs: ['-v'],
      envFile: {
        filePath: './.env',
        fallback: true
      },
      rc: {
        environments: ['dev'],
        filePath: './.rc'
      }
    })
    assert.equal(getEnvVarsStub.callCount, 1)
    assert.equal(spawnStub.callCount, 1)
  })

  it('should override existing env vars if noOverride option is false/missing',
    async (): Promise<void> => {
      process.env.BOB = 'cool'
      getEnvVarsStub.returns({ BOB: 'test' })
      await envCmdLib.EnvCmd({
        command: 'node',
        commandArgs: ['-v'],
        envFile: {
          filePath: './.env',
          fallback: true
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc'
        }
      })
      assert.equal(getEnvVarsStub.callCount, 1)
      assert.equal(spawnStub.callCount, 1)
      assert.equal(spawnStub.args[0][2].env.BOB, 'test')
    }
  )

  it('should not override existing env vars if noOverride option is true',
    async (): Promise<void> => {
      process.env.BOB = 'cool'
      getEnvVarsStub.returns({ BOB: 'test' })
      await envCmdLib.EnvCmd({
        command: 'node',
        commandArgs: ['-v'],
        envFile: {
          filePath: './.env',
          fallback: true
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc'
        },
        options: {
          noOverride: true
        }
      })
      assert.equal(getEnvVarsStub.callCount, 1)
      assert.equal(spawnStub.callCount, 1)
      assert.equal(spawnStub.args[0][2].env.BOB, 'cool')
    }
  )

  it('should spawn process with shell option if useShell option is true',
    async (): Promise<void> => {
      process.env.BOB = 'cool'
      getEnvVarsStub.returns({ BOB: 'test' })
      await envCmdLib.EnvCmd({
        command: 'node',
        commandArgs: ['-v'],
        envFile: {
          filePath: './.env',
          fallback: true
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc'
        },
        options: {
          useShell: true
        }
      })
      assert.equal(getEnvVarsStub.callCount, 1)
      assert.equal(spawnStub.callCount, 1)
      assert.equal(spawnStub.args[0][2].shell, true)
    }
  )

  it('should spawn process with command and args expanded if expandEnvs option is true',
    async (): Promise<void> => {
      getEnvVarsStub.returns({ PING: 'PONG', CMD: 'node' })
      await envCmdLib.EnvCmd({
        command: '$CMD',
        commandArgs: ['$PING', '\\$IP'],
        envFile: {
          filePath: './.env',
          fallback: true
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc'
        },
        options: {
          expandEnvs: true
        }
      })

      const spawnArgs = spawnStub.args[0]

      assert.equal(getEnvVarsStub.callCount, 1, 'getEnvVars must be called once')
      assert.equal(spawnStub.callCount, 1)
      assert.equal(expandEnvsSpy.callCount, 3, 'command + number of args')
      assert.equal(spawnArgs[0], 'node')
      assert.sameOrderedMembers(spawnArgs[1], ['PONG', '\\$IP'])
      assert.equal(spawnArgs[2].env.PING, 'PONG')
    }
  )

  it('should spawn process with command and args interpolated if interpolation option is true',
    async (): Promise<void> => {
      getEnvVarsStub.returns({ PING: 'PONG', CMD: 'node' })
      await envCmdLib.EnvCmd({
        command: '{{CMD}}',
        commandArgs: ['{{PING}}', '\\{{IP}}'],
        envFile: {
          filePath: './.env',
          fallback: true
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc'
        },
        options: {
          interpolateEnvs: true
        }
      })

      const spawnArgs = spawnStub.args[0]

      assert.equal(getEnvVarsStub.callCount, 1, 'getEnvVars must be called once')
      assert.equal(spawnStub.callCount, 1)
      assert.equal(interpolateEnvsSpy.callCount, 3, 'command + number of args')
      assert.equal(spawnArgs[0], 'node')
      assert.sameOrderedMembers(spawnArgs[1], ['PONG', '\\{{IP}}'])
      assert.equal(spawnArgs[2].env.PING, 'PONG')
    }
  )

  it('should ignore errors if silent flag provided',
    async (): Promise<void> => {
      delete process.env.BOB
      getEnvVarsStub.throws('MissingFile')
      await envCmdLib.EnvCmd({
        command: 'node',
        commandArgs: ['-v'],
        envFile: {
          filePath: './.env'
        },
        options: {
          silent: true
        }
      })
      assert.equal(getEnvVarsStub.callCount, 1)
      assert.equal(spawnStub.callCount, 1)
      assert.isUndefined(spawnStub.args[0][2].env.BOB)
    }
  )

  it('should allow errors if silent flag not provided',
    async (): Promise<void> => {
      getEnvVarsStub.throws('MissingFile')
      try {
        await envCmdLib.EnvCmd({
          command: 'node',
          commandArgs: ['-v'],
          envFile: {
            filePath: './.env'
          }
        })
      } catch (e) {
        assert.equal(e.name, 'MissingFile')
        return
      }
      assert.fail('Should not get here.')
    }
  )
})
