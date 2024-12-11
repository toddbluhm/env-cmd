import { assert } from 'chai'
import { getEnvFileVars } from '../src/parse-env-file.js'

describe('getEnvFileVars', (): void => {
  it('should parse a json file', async (): Promise<void> => {
    const env = await getEnvFileVars('./test/test-files/test.json')
    assert.deepEqual(env, {
      THANKS: 'FOR WHAT?!',
      ANSWER: 42,
      ONLY: 'IN PRODUCTION',
      GALAXY: 'hitch\nhiking',
      BRINGATOWEL: true,
    })
  })

  it('should parse a json file keeping all newlines intact', async (): Promise<void> => {
    const env = await getEnvFileVars('./test/test-files/test-newlines.json')
    assert.deepEqual(env, {
      THANKS: 'FOR WHAT?!',
      ANSWER: 42,
      ONLY: 'IN\n PRODUCTION',
      GALAXY: 'hitch\nhiking\n\n',
      BRINGATOWEL: true,
    })
  })

  it('should parse a js/cjs file', async (): Promise<void> => {
    const env = await getEnvFileVars('./test/test-files/test.cjs')
    assert.deepEqual(env, {
      THANKS: 'FOR ALL THE FISH',
      ANSWER: 0,
      GALAXY: 'hitch\nhiking',
    })
  })

  it('should parse an async js/cjs file', async (): Promise<void> => {
    const env = await getEnvFileVars('./test/test-files/test-async.cjs')
    assert.deepEqual(env, {
      THANKS: 'FOR ALL THE FISH',
      ANSWER: 0,
    })
  })

  it('should parse a mjs file', async (): Promise<void> => {
    const env = await getEnvFileVars('./test/test-files/test.mjs')
    assert.deepEqual(env, {
      THANKS: 'FOR ALL THE FISH',
      ANSWER: 0,
      GALAXY: 'hitch\nhiking',
    })
  })

  it('should parse an async mjs file', async (): Promise<void> => {
    const env = await getEnvFileVars('./test/test-files/test-async.mjs')
    assert.deepEqual(env, {
      THANKS: 'FOR ALL THE FISH',
      ANSWER: 0,
    })
  })

  it('should parse an env file', async (): Promise<void> => {
    const env = await getEnvFileVars('./test/test-files/test')
    assert.deepEqual(env, {
      THANKS: 'FOR WHAT?!',
      ANSWER: 42,
      ONLY: 'IN=PRODUCTION',
      GALAXY: 'hitch\nhiking',
      BRINGATOWEL: true,
    })
  })

  it('should throw error if invalid path provided', async (): Promise<void> => {
    try {
      await getEnvFileVars('./test/test-files/non-existent-file')
      assert.fail('Should not get here!')
    }
    catch (e) {
      assert.instanceOf(e, Error)
      assert.match(e.message, /file path/gi)
    }
  })
})
