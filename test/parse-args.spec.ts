/* eslint @typescript-eslint/no-non-null-assertion: 0 */
import { assert } from 'chai'
import { parseArgs } from '../src/parse-args'

describe('parseArgs', (): void => {
  const command = 'command'
  const commandArgs = ['cmda1', 'cmda2', '--cmda3', '-4', 'cmda4']
  const environments = ['development', 'production']
  const rcFilePath = './.env-cmdrc'
  const envFilePath = './.env'
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
})
