import * as os from 'os'
import * as process from 'process'
import { assert } from 'chai'
import * as sinon from 'sinon'
import { resolveEnvFilePath, parseArgList, isPromise } from '../src/utils'

describe('utils', (): void => {
  describe('resolveEnvFilePath', (): void => {
    const homePath = os.homedir()
    const currentDir = process.cwd()

    afterEach((): void => {
      sinon.restore()
    })

    it('should return an absolute path, given a relative path', (): void => {
      const res = resolveEnvFilePath('./bob')
      assert.equal(res, `${currentDir}/bob`)
    })

    it('should return an absolute path, given a path with ~ for home directory', (): void => {
      const res = resolveEnvFilePath('~/bob')
      assert.equal(res, `${homePath}/bob`)
    })

    it('should not attempt to replace ~ if home dir does not exist', (): void => {
      sinon.stub(os, 'homedir')
      const res = resolveEnvFilePath('~/bob')
      assert.equal(res, `${currentDir}/~/bob`)
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
  })
})
