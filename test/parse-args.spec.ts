/* eslint @typescript-eslint/no-non-null-assertion: 0 */
import * as sinon from 'sinon'
import { assert } from 'chai'
import { parseArgs } from '../src/parse-args'

describe('parseArgs', (): void => {
  const command = 'command'
  const commandArgs = ['cmda1', 'cmda2', '--cmda3', '-4', 'cmda4', '--fallback']
  const environments = ['development', 'production']
  const rcFilePath = './.env-cmdrc'
  const envFilePath = './.env'
  let logInfoStub: sinon.SinonStub<any, any>

  before((): void => {
    logInfoStub = sinon.stub(console, 'info')
  })

  after((): void => {
    sinon.restore()
  })

  afterEach((): void => {
    sinon.resetHistory()
    sinon.resetBehavior()
  })

  it('should parse environment value', (): void => {
    const res = parseArgs(['-e', environments[0], command])
    assert.exists(res.rc)
    assert.sameOrderedMembers(res.rc!.environments, [environments[0]])
  })

  it('should parse multiple environment values', (): void => {
    const res = parseArgs(['-e', environments.join(','), command])
    assert.exists(res.rc)
    assert.sameOrderedMembers(res.rc!.environments, environments)
  })

  it('should parse command value', (): void => {
    const res = parseArgs(['-e', environments[0], command])
    assert.equal(res.command, command)
  })

  it('should parse multiple command arguments', (): void => {
    const res = parseArgs(['-e', environments[0], command, ...commandArgs])
    assert.sameOrderedMembers(res.commandArgs, commandArgs)
  })

  it('should parse multiple command arguments even if they use the same options flags as env-cmd',
    (): void => {
      const commandFlags = ['-f', './other-file', '--use-shell', '-r']
      const res = parseArgs(['-e', environments[0], command, ...commandFlags])
      assert.sameOrderedMembers(res.commandArgs, commandFlags)
      assert.notOk(res.options!.useShell)
      assert.notOk(res.envFile)
    }
  )

  it('should parse override option', (): void => {
    const res = parseArgs(['-e', environments[0], '--no-override', command, ...commandArgs])
    assert.exists(res.options)
    assert.isTrue(res.options!.noOverride)
  })

  it('should parse use shell option', (): void => {
    const res = parseArgs(['-e', environments[0], '--use-shell', command, ...commandArgs])
    assert.exists(res.options)
    assert.isTrue(res.options!.useShell)
  })

  it('should parse rc file path', (): void => {
    const res = parseArgs(['-e', environments[0], '-r', rcFilePath, command, ...commandArgs])
    assert.exists(res.rc)
    assert.equal(res.rc!.filePath, rcFilePath)
  })

  it('should parse env file path', (): void => {
    const res = parseArgs(['-f', envFilePath, command, ...commandArgs])
    assert.exists(res.envFile)
    assert.equal(res.envFile!.filePath, envFilePath)
  })

  it('should parse fallback option', (): void => {
    const res = parseArgs(['-f', envFilePath, '--fallback', command, ...commandArgs])
    assert.exists(res.envFile)
    assert.isTrue(res.envFile!.fallback)
  })

  it('should print to console.info if --verbose flag is passed', (): void => {
    const res = parseArgs(['-f', envFilePath, '--verbose', command, ...commandArgs])
    assert.exists(res.options!.verbose)
    assert.equal(logInfoStub.callCount, 1)
  })

  it('should parse expandEnvs option', (): void => {
    const res = parseArgs(['-f', envFilePath, '-x', command, ...commandArgs])
    assert.exists(res.envFile)
    assert.isTrue(res.options!.expandEnvs)
  })

  it('should parse interpolateEnvs option', (): void => {
    const res = parseArgs(['-f', envFilePath, '-i', command, ...commandArgs])
    assert.exists(res.envFile)
    assert.isTrue(res.options!.interpolateEnvs)
  })

  it('should parse silent option', (): void => {
    const res = parseArgs(['-f', envFilePath, '--silent', command, ...commandArgs])
    assert.exists(res.envFile)
    assert.isTrue(res.options!.silent)
  })
})
