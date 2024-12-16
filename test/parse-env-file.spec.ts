import { assert } from 'chai'
import {
  stripEmptyLines, stripComments, parseEnvVars,
  parseEnvString, getEnvFileVars,
} from '../src/parse-env-file.js'

describe('stripEmptyLines', (): void => {
  it('should strip out all empty lines', (): void => {
    const envString = stripEmptyLines('\nBOB=COOL\n\nNODE_ENV=dev\n\nANSWER=42 AND COUNTING\n\n')
    assert(envString === 'BOB=COOL\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n')
  })
})

describe('stripComments', (): void => {
  it('should strip out all full line comments', (): void => {
    const envString = stripComments('#BOB=COOL\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n#AnotherComment\n')
    assert(envString === '\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n\n')
  })

  it('should not strip out #s from values', (): void => {
    const envString = stripComments('#\nBOB=COMMENT#ELL\n#\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n#AnotherComment\n')
    assert(envString === '\nBOB=COMMENT#ELL\n\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n\n', envString)
  })
})

describe('parseEnvVars', (): void => {
  it('should parse out all env vars in string when not ending with \'\\n\'', (): void => {
    const envVars = parseEnvVars('BOB=COOL\nNODE_ENV=dev\nANSWER=42 AND COUNTING\nNUMBER=42\nBOOLEAN=true')
    assert(envVars.BOB === 'COOL')
    assert(envVars.NODE_ENV === 'dev')
    assert(envVars.ANSWER === '42 AND COUNTING')
    assert(envVars.NUMBER === 42)
    assert(envVars.BOOLEAN === true)
  })

  it('should parse out all env vars in string with format \'key=value\'', (): void => {
    const envVars = parseEnvVars('BOB=COOL\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n')
    assert(envVars.BOB === 'COOL')
    assert(envVars.NODE_ENV === 'dev')
    assert(envVars.ANSWER === '42 AND COUNTING')
  })

  it('should ignore invalid lines', (): void => {
    const envVars = parseEnvVars('BOB=COOL\nTHISIS$ANDINVALIDLINE\nANSWER=42 AND COUNTING\n')
    assert(Object.keys(envVars).length === 2)
    assert(envVars.BOB === 'COOL')
    assert(envVars.ANSWER === '42 AND COUNTING')
  })

  it('should default an empty value to an empty string', (): void => {
    const envVars = parseEnvVars('EMPTY=\n')
    assert(envVars.EMPTY === '')
  })

  it('should escape double quoted values', (): void => {
    const envVars = parseEnvVars('DOUBLE_QUOTES="double_quotes"\n')
    assert(envVars.DOUBLE_QUOTES === 'double_quotes')
  })

  it('should escape single quoted values', (): void => {
    const envVars = parseEnvVars('SINGLE_QUOTES=\'single_quotes\'\n')
    assert(envVars.SINGLE_QUOTES === 'single_quotes')
  })

  it('should preserve embedded double quotes', (): void => {
    const envVars = parseEnvVars('DOUBLE=""""\nDOUBLE_ONE=\'"double_one"\'\nDOUBLE_TWO=""double_two""\n')
    assert(envVars.DOUBLE === '""')
    assert(envVars.DOUBLE_ONE === '"double_one"')
    assert(envVars.DOUBLE_TWO === '"double_two"')
  })

  it('should preserve newlines when surrounded in quotes', (): void => {
    const envVars = parseEnvVars('ONE_NEWLINE="ONE\\n"\nTWO_NEWLINES="HELLO\\nWORLD\\n"\nTHREE_NEWLINES="HELLO\\n\\nWOR\\nLD"\n')
    assert(envVars.ONE_NEWLINE === 'ONE\n')
    assert(envVars.TWO_NEWLINES === 'HELLO\nWORLD\n')
    assert(envVars.THREE_NEWLINES === 'HELLO\n\nWOR\nLD')
  })

  it('should preserve embedded single quotes', (): void => {
    const envVars = parseEnvVars('SINGLE=\'\'\'\'\nSINGLE_ONE=\'\'single_one\'\'\nSINGLE_TWO="\'single_two\'"\n')
    assert(envVars.SINGLE === '\'\'')
    assert(envVars.SINGLE_ONE === '\'single_one\'')
    assert(envVars.SINGLE_TWO === '\'single_two\'')
  })

  it('should parse out all env vars ignoring spaces around = sign', (): void => {
    const envVars = parseEnvVars('BOB = COOL\nNODE_ENV =dev\nANSWER= 42 AND COUNTING')
    assert(envVars.BOB === 'COOL')
    assert(envVars.NODE_ENV === 'dev')
    assert(envVars.ANSWER === '42 AND COUNTING')
  })

  it('should parse out all env vars ignoring spaces around = sign', (): void => {
    const envVars = parseEnvVars('BOB = "COOL "\nNODE_ENV = dev\nANSWER= \' 42 AND COUNTING\'')
    assert(envVars.BOB === 'COOL ')
    assert(envVars.NODE_ENV === 'dev')
    assert(envVars.ANSWER === ' 42 AND COUNTING')
  })

  describe('value', () => {
    const testCases = [
      [`a`, `a`],
      [`'a'`, `a`],
      [`"a"`, `a`],
      [`"a"`, `a`],
      [`"single 'quotes' inside double"`, `single 'quotes' inside double`],
      [`'double "quotes" inside single'`, `double "quotes" inside single`],
      [`a # comment without quotes`, `a`],
      [`'a' # comment with single quotes`, `a`],
      [`"a" # comment with double quotes`, `a`],
      [`"a"garbage after final quote`, `a`],
      [
        `"double quotes " within double quotes"`,
        `double quotes " within double quotes`,
      ],
      [
        `'single quotes ' within single quotes'`,
        `single quotes ' within single quotes`,
      ],
      [`line\\nbreaks`, `line\nbreaks`],
      [`"line\\n\\nbreaks in quotes"`, `line\n\nbreaks in quotes`],
    ];
    for (const [input, output] of testCases) {
      it(`should parse ${input}`, () => {
        assert.equal(parseEnvVars(`KEY=${input}`).KEY, output)
      })
    }
  })
})

describe('parseEnvString', (): void => {
  it('should parse env vars and merge (overwrite) with process.env vars', (): void => {
    const env = parseEnvString('BOB=COOL\nNODE_ENV=dev\nANSWER=42\n')
    assert(env.BOB === 'COOL')
    assert(env.NODE_ENV === 'dev')
    assert(env.ANSWER === 42)
  })
})

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
      a: 1,
      b: 2,
      c: 3,
      d: "=",
      e: "equals symbol = = ",
      json_no_quotes: "{\"foo\": \"bar\"}",
      json_with_quotes: "{\"foo\": \"bar\"}",
      quotes: "hello \n\n \" 'escaped \\tsingle quote' \" #cool #fun ",
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
