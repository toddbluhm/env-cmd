import { assert } from 'chai'
import { readFileSync } from 'fs'
import { getRCFileVars, parseRCFile } from '../src/parse-rc-file'

const rcFilePath = './test/test-files/.rc-test'
const rcJSONFilePath = './test/test-files/.rc-test.json'

describe('parseRCFile', (): void => {
  it('should parse an .rc file', (): void => {
    const file = readFileSync(rcFilePath, { encoding: 'utf8' })
    const res = parseRCFile(file)
    assert.exists(res)
    assert.hasAllKeys(res, ['development', 'test', 'production'])
    assert.equal(res.development.ANSWER, 0)
    assert.equal(res.production.THANKS, 'FOR WHAT?!')
  })

  it('should fail to parse an .rc file', (): void => {
    try {
      parseRCFile('fdsjk dsjfksdjkla')
      assert.fail('Should not get here!')
    } catch (e) {
      assert.match(e.message, /parse/gi)
    }
  })
})

describe('getRCFileVars', (): void => {
  it('should parse an .rc file with the given environment', async (): Promise<void> => {
    const res = await getRCFileVars({ environments: ['production'], filePath: rcFilePath })
    assert.exists(res)
    assert.deepEqual(res, {
      THANKS: 'FOR WHAT?!',
      ANSWER: 42,
      ONLY: 'IN PRODUCTION'
    })
  })

  it('should parse a .rc.json file', async (): Promise<void> => {
    const res = await getRCFileVars({ environments: ['test'], filePath: rcJSONFilePath })
    assert.exists(res)
    assert.deepEqual(res, {
      THANKS: 'FOR MORE FISHIES',
      ANSWER: 21
    })
  })

  it('should fail to parse a .rc file if environment does not exist', async (): Promise<void> => {
    try {
      await getRCFileVars({ environments: ['bad'], filePath: rcFilePath })
      assert.fail('Should not get here!')
    } catch (e) {
      assert.match(e.message, /environments/gi)
    }
  })

  it('should fail to parse an .rc file', async (): Promise<void> => {
    try {
      await getRCFileVars({ environments: ['bad'], filePath: './non-existent-file' })
      assert.fail('Should not get here!')
    } catch (e) {
      assert.match(e.message, /path/gi)
    }
  })

  it('should parse an async js .rc file', async (): Promise<void> => {
    const env = await getRCFileVars({
      environments: ['production'],
      filePath: './test/test-files/.rc-test-async.js'
    })
    assert.deepEqual(env, {
      THANKS: 'FOR WHAT?!',
      ANSWER: 42,
      ONLY: 'IN PRODUCTION'
    })
  })
})
