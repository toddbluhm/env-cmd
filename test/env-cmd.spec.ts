import * as sinon from 'sinon'
import { assert } from 'chai'
import * as parseArgsLib from '../src/parse-args'
import * as getEnvVarsLib from '../src/get-env-vars'
import * as spawnLib from '../src/spawn'
import * as envCmdLib from '../src/env-cmd'

describe('CLI', (): void => {
  let parseArgsStub: sinon.SinonStub
  let envCmdStub: sinon.SinonStub
  before((): void => {
    parseArgsStub = sinon.stub(parseArgsLib, 'parseArgs')
    envCmdStub = sinon.stub(envCmdLib, 'EnvCmd')
  })

  after((): void => {
    sinon.restore()
  })

  it('should parse the provided args and execute the EnvCmd', async (): Promise<void> => {
    parseArgsStub.returns({})
    await envCmdLib.CLI(['node', './env-cmd', '-v'])
    assert.equal(parseArgsStub.callCount, 1)
    assert.equal(envCmdStub.callCount, 1)
  })
})

describe('EnvCmd', (): void => {
  let getEnvVarsStub: sinon.SinonStub
  let spawnStub: sinon.SinonStub
  before((): void => {
    getEnvVarsStub = sinon.stub(getEnvVarsLib, 'getEnvVars')
    spawnStub = sinon.stub(spawnLib, 'spawn')
    spawnStub.returns({ on: (): void => {}, kill: (): void => {} })
  })

  after((): void => {
    sinon.restore()
  })

  afterEach((): void => {
    sinon.resetHistory()
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

  it('should should override existing env vars if noOverride option is false/missing',
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

  it('should should not override existing env vars if noOverride option is true',
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

  it('should should spawn process with shell option if useShell option is true',
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
})
