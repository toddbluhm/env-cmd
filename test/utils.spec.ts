import { homedir } from 'node:os'
import { cwd } from 'node:process'
import { normalize } from 'node:path'
import { assert } from 'chai'
import { default as sinon } from 'sinon'
import { default as esmock } from 'esmock'
import { resolveEnvFilePath, parseArgList, isPromise } from '../src/utils.js'

let utilsLib: { 
  resolveEnvFilePath: typeof resolveEnvFilePath,
  parseArgList: typeof parseArgList,
  isPromise: typeof isPromise
}

describe('utils', (): void => {
  describe('resolveEnvFilePath', (): void => {
    const homePath = homedir()
    const currentDir = cwd()
    let homedirStub: sinon.SinonStub<any>

    before(async (): Promise<void> => {
      homedirStub = sinon.stub()
      utilsLib = await esmock('../src/utils.js', {
        'node:os': {
          homedir: homedirStub
        },
      })
    })

    afterEach((): void => {
      sinon.restore()
    })

    it('should return an absolute path, given a relative path', (): void => {
      const res = resolveEnvFilePath('./bob')
      assert.equal(res, normalize(`${currentDir}/bob`))
    })

    it('should return an absolute path, given a path with ~ for home directory', (): void => {
      const res = resolveEnvFilePath('~/bob')
      assert.equal(res, normalize(`${homePath}/bob`))
    })

    it('should not attempt to replace ~ if home dir does not exist', (): void => {
      const res = utilsLib.resolveEnvFilePath('~/bob')
      assert.equal(res, normalize(`${currentDir}/~/bob`))
    })
  })

  describe('parseArgList', (): void => {
    it('should parse a cli arg list', (): void => {
      const res = parseArgList('thanks,for,all,the,fish')
      assert.lengthOf(res, 5)
      assert.includeOrderedMembers(res, ['thanks', 'for', 'all', 'the', 'fish'])
    })
  })

  describe('isPromise', (): void => {
    it('should return true for native promise', (): void => {
      const res = isPromise(Promise.resolve())
      assert.isTrue(res)
    })
    it('should return false for plain object', (): void => {
      const res = isPromise({})
      assert.isFalse(res)
    })
    it('should return false for string', (): void => {
      const res = isPromise('test')
      assert.isFalse(res)
    })
    it('should return false for undefined', (): void => {
      const res = isPromise(undefined)
      assert.isFalse(res)
    })
  })
})
