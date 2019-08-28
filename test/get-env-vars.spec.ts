import * as sinon from 'sinon'
import { assert } from 'chai'
import { getEnvVars } from '../src/get-env-vars'
import * as rcFile from '../src/parse-rc-file'
import * as envFile from '../src/parse-env-file'

describe('getEnvVars', (): void => {
  let getRCFileVarsStub: sinon.SinonStub<any, any>
  let getEnvFileVarsStub: sinon.SinonStub<any, any>
  let logStub: sinon.SinonStub<any, any>

  const pathError = new Error()
  pathError.name = 'PathError'

  before((): void => {
    getRCFileVarsStub = sinon.stub(rcFile, 'getRCFileVars')
    getEnvFileVarsStub = sinon.stub(envFile, 'getEnvFileVars')
    logStub = sinon.stub(console, 'error')
  })

  after((): void => {
    sinon.restore()
  })

  afterEach((): void => {
    sinon.resetHistory()
    sinon.resetBehavior()
  })

  it('should parse the json .rc file from the default location with the given environment',
    async (): Promise<void> => {
      getRCFileVarsStub.returns({ THANKS: 'FORALLTHEFISH' })
      const envs = await getEnvVars({ rc: { environments: ['production'] } })
      assert.isOk(envs)
      assert.lengthOf(Object.keys(envs), 1)
      assert.equal(envs.THANKS, 'FORALLTHEFISH')
      assert.equal(getRCFileVarsStub.callCount, 1)
      assert.lengthOf(getRCFileVarsStub.args[0][0].environments, 1)
      assert.equal(getRCFileVarsStub.args[0][0].environments[0], 'production')
      assert.equal(getRCFileVarsStub.args[0][0].filePath, './.env-cmdrc')
    }
  )

  it('should search all default .rc file locations', async (): Promise<void> => {
    getRCFileVarsStub.rejects(pathError)
    getRCFileVarsStub.onThirdCall().returns({ THANKS: 'FORALLTHEFISH' })
    const envs = await getEnvVars({ rc: { environments: ['production'] } })
    assert.isOk(envs)
    assert.lengthOf(Object.keys(envs), 1)
    assert.equal(envs.THANKS, 'FORALLTHEFISH')
    assert.equal(getRCFileVarsStub.callCount, 3)
    assert.lengthOf(getRCFileVarsStub.args[2][0].environments, 1)
    assert.equal(getRCFileVarsStub.args[2][0].environments[0], 'production')
    assert.equal(getRCFileVarsStub.args[2][0].filePath, './.env-cmdrc.json')
  })

  it('should fail to find .rc file at default location', async (): Promise<void> => {
    getRCFileVarsStub.rejects(pathError)
    try {
      await getEnvVars({ rc: { environments: ['production'] } })
      assert.fail('should not get here.')
    } catch (e) {
      assert.match(e.message, /locate \.rc/gi)
    }
  })

  it('should log to error console on non-path errors', async (): Promise<void> => {
    getRCFileVarsStub.rejects(new Error('Non-path Error'))
    try {
      await getEnvVars({ rc: { environments: ['production'] } })
      assert.fail('should not get here.')
    } catch (e) {
      assert.match(logStub.getCall(0).args[0].message, /non-path error/gi)
      assert.match(e.message, /locate \.rc/gi)
    }
  })

  it('should find .rc file at custom path location', async (): Promise<void> => {
    getRCFileVarsStub.returns({ THANKS: 'FORALLTHEFISH' })
    const envs = await getEnvVars({
      rc: { environments: ['production'], filePath: '../.custom-rc' }
    })
    assert.isOk(envs)
    assert.lengthOf(Object.keys(envs), 1)
    assert.equal(envs.THANKS, 'FORALLTHEFISH')
    assert.equal(getRCFileVarsStub.callCount, 1)
    assert.lengthOf(getRCFileVarsStub.args[0][0].environments, 1)
    assert.equal(getRCFileVarsStub.args[0][0].environments[0], 'production')
    assert.equal(getRCFileVarsStub.args[0][0].filePath, '../.custom-rc')
  })

  it('should fail to find .rc file at custom path location', async (): Promise<void> => {
    getRCFileVarsStub.rejects(pathError)
    try {
      await getEnvVars({
        rc: { environments: ['production'], filePath: '../.custom-rc' }
      })
      assert.fail('should not get here.')
    } catch (e) {
      assert.match(e.message, /locate \.rc/gi)
    }
  })

  it('should log to error console on non-path errors', async (): Promise<void> => {
    getRCFileVarsStub.rejects(new Error('Non-path Error'))
    try {
      await getEnvVars({
        rc: { environments: ['production'], filePath: '../.custom-rc' }
      })
      assert.fail('should not get here.')
    } catch (e) {
      assert.match(logStub.getCall(0).args[0].message, /non-path error/gi)
      assert.match(e.message, /locate \.rc/gi)
    }
  })

  it('should parse the env file from a custom location', async (): Promise<void> => {
    getEnvFileVarsStub.returns({ THANKS: 'FORALLTHEFISH' })
    const envs = await getEnvVars({ envFile: { filePath: '../.env-file' } })
    assert.isOk(envs)
    assert.lengthOf(Object.keys(envs), 1)
    assert.equal(envs.THANKS, 'FORALLTHEFISH')
    assert.equal(getEnvFileVarsStub.callCount, 1)
    assert.equal(getEnvFileVarsStub.args[0][0], '../.env-file')
  })

  it('should fail to find env file at custom location', async (): Promise<void> => {
    getEnvFileVarsStub.rejects('Not found.')
    try {
      await getEnvVars({ envFile: { filePath: '../.env-file' } })
      assert.fail('should not get here.')
    } catch (e) {
      assert.match(e.message, /locate env/gi)
    }
  })

  it('should parse the env file from the default location if custom ' +
    'location not found and fallback option provided',
  async (): Promise<void> => {
    getEnvFileVarsStub.onFirstCall().rejects('File not found.')
    getEnvFileVarsStub.returns({ THANKS: 'FORALLTHEFISH' })
    const envs = await getEnvVars({ envFile: { filePath: '../.env-file', fallback: true } })
    assert.isOk(envs)
    assert.lengthOf(Object.keys(envs), 1)
    assert.equal(envs.THANKS, 'FORALLTHEFISH')
    assert.equal(getEnvFileVarsStub.callCount, 2)
    assert.equal(getEnvFileVarsStub.args[1][0], './.env')
  }
  )

  it('should parse the env file from the default location', async (): Promise<void> => {
    getEnvFileVarsStub.returns({ THANKS: 'FORALLTHEFISH' })
    const envs = await getEnvVars()
    assert.isOk(envs)
    assert.lengthOf(Object.keys(envs), 1)
    assert.equal(envs.THANKS, 'FORALLTHEFISH')
    assert.equal(getEnvFileVarsStub.callCount, 1)
    assert.equal(getEnvFileVarsStub.args[0][0], './.env')
  })

  it('should search all default env file locations', async (): Promise<void> => {
    getEnvFileVarsStub.throws('Not found.')
    getEnvFileVarsStub.onThirdCall().returns({ THANKS: 'FORALLTHEFISH' })
    const envs = await getEnvVars()
    assert.isOk(envs)
    assert.lengthOf(Object.keys(envs), 1)
    assert.equal(envs.THANKS, 'FORALLTHEFISH')
    assert.equal(getEnvFileVarsStub.callCount, 3)
    assert.isTrue(getEnvFileVarsStub.calledWithExactly('./.env.json'))
    assert.isTrue(getEnvFileVarsStub.calledWithExactly('./.env.json'))
  })

  it('should fail to find env file at default location', async (): Promise<void> => {
    getEnvFileVarsStub.rejects('Not found.')
    try {
      await getEnvVars()
      assert.fail('should not get here.')
    } catch (e) {
      assert.match(e.message, /locate env/gi)
    }
  })
})
