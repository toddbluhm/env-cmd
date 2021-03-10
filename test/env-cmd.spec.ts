import { default as sinon } from 'sinon'
import { assert } from 'chai'
import { default as esmock } from 'esmock'
import { expandEnvs } from '../src/expand-envs.js'
import type { EnvCmd } from '../src/env-cmd.ts'

let envCmdLib: { EnvCmd: typeof EnvCmd }

describe('EnvCmd', (): void => {
  let sandbox: sinon.SinonSandbox
  let getEnvVarsStub: sinon.SinonStub<any>
  let spawnStub: sinon.SinonStub<any>
  let expandEnvsSpy: sinon.SinonSpy<any>
  before(async (): Promise<void> => {
    sandbox = sinon.createSandbox()
    getEnvVarsStub = sandbox.stub()
    spawnStub = sandbox.stub()
    spawnStub.returns({
      on: sinon.stub(),
      kill: sinon.stub(),
    })
    expandEnvsSpy = sandbox.spy(expandEnvs)

    const TermSignals = sandbox.stub()
    TermSignals.prototype.handleTermSignals = sandbox.stub()
    TermSignals.prototype.handleUncaughtExceptions = sandbox.stub()

    envCmdLib = await esmock('../src/env-cmd.ts', {
      '../src/get-env-vars': {
        getEnvVars: getEnvVarsStub,
      },
      'cross-spawn': {
        default: spawnStub,
      },
      '../src/expand-envs': {
        expandEnvs: expandEnvsSpy,
      },
      '../src/signal-termination': {
        TermSignals,
      },
    })
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
        fallback: true,
      },
      rc: {
        environments: ['dev'],
        filePath: './.rc',
      },
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
          fallback: true,
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc',
        },
      })
      assert.equal(getEnvVarsStub.callCount, 1)
      assert.equal(spawnStub.callCount, 1)
      assert.equal(spawnStub.args[0][2].env.BOB, 'test')
    },
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
          fallback: true,
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc',
        },
        options: {
          noOverride: true,
        },
      })
      assert.equal(getEnvVarsStub.callCount, 1)
      assert.equal(spawnStub.callCount, 1)
      assert.equal(spawnStub.args[0][2].env.BOB, 'cool')
    },
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
          fallback: true,
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc',
        },
        options: {
          useShell: true,
        },
      })
      assert.equal(getEnvVarsStub.callCount, 1)
      assert.equal(spawnStub.callCount, 1)
      assert.equal(spawnStub.args[0][2].shell, true)
    },
  )

  it('should spawn process with command and args expanded if expandEnvs option is true',
    async (): Promise<void> => {
      getEnvVarsStub.returns({ PING: 'PONG', CMD: 'node' })
      await envCmdLib.EnvCmd({
        command: '$CMD',
        commandArgs: ['$PING', '\\$IP'],
        envFile: {
          filePath: './.env',
          fallback: true,
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc',
        },
        options: {
          expandEnvs: true,
        },
      })

      const spawnArgs = spawnStub.args[0]

      assert.equal(getEnvVarsStub.callCount, 1, 'getEnvVars must be called once')
      assert.equal(spawnStub.callCount, 1)
      assert.equal(expandEnvsSpy.callCount, 3, 'command + number of args')
      assert.equal(spawnArgs[0], 'node')
      assert.sameOrderedMembers(spawnArgs[1] as string[], ['PONG', '\\$IP'])
      assert.equal(spawnArgs[2].env.PING, 'PONG')
    },
  )

  it('should spawn process with args expanded if recursive option is true',
    async (): Promise<void> => {
      getEnvVarsStub.returns({ PING: 'PONG', recursive: 'PING ${PING}' }) /* eslint-disable-line */
      await envCmdLib.EnvCmd({
        command: 'node',
        commandArgs: [],
        envFile: {
          filePath: './.env',
          fallback: true
        },
        rc: {
          environments: ['dev'],
          filePath: './.rc'
        },
        options: {
          recursive: true
        }
      })

      const spawnArgs = spawnStub.args[0]

      assert.equal(getEnvVarsStub.callCount, 1, 'getEnvVars must be called once')
      assert.equal(spawnStub.callCount, 1)
      assert.isAtLeast(expandEnvsSpy.callCount, 3, 'total number of env args')
      assert.equal(spawnArgs[0], 'node')
      assert.equal(spawnArgs[2].env.recursive, 'PING PONG')
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
          filePath: './.env',
        },
        options: {
          silent: true,
        },
      })
      assert.equal(getEnvVarsStub.callCount, 1)
      assert.equal(spawnStub.callCount, 1)
      assert.isUndefined(spawnStub.args[0][2].env.BOB)
    },
  )

  it('should allow errors if silent flag not provided',
    async (): Promise<void> => {
      getEnvVarsStub.throws('MissingFile')
      try {
        await envCmdLib.EnvCmd({
          command: 'node',
          commandArgs: ['-v'],
          envFile: {
            filePath: './.env',
          },
        })
      }
      catch (e) {
        assert.instanceOf(e, Error)
        assert.equal(e.name, 'MissingFile')
        return
      }
      assert.fail('Should not get here.')
    },
  )

  it('provides a helpful error if the CLI is incorrectly invoked', async () => {
    getEnvVarsStub.returns({ BOB: 'test' });
    try {
      await envCmdLib.EnvCmd({
        command: '',
        commandArgs: [],
        envFile: {
          filePath: './.env',
        },
      });
    } catch (e) {
      assert.instanceOf(e, Error);
      assert.include(e.message, 'cannot be used as a standalone');
      return;
    }
    assert.fail('Should not get here.');
  });
})
