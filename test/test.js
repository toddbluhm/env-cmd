'use strict'

const assert = require('better-assert')
const describe = require('mocha').describe
const it = require('mocha').it
const afterEach = require('mocha').afterEach
const beforeEach = require('mocha').beforeEach
const before = require('mocha').before
const after = require('mocha').after
const path = require('path')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const fs = require('fs')
let userHomeDir = '/Users/hitchhikers-guide-to-the-galaxy'

const spawnStub = sinon.spy(() => ({
  on: sinon.stub(),
  exit: sinon.stub(),
  kill: sinon.stub()
}))

const lib = proxyquire('../lib', {
  'cross-spawn': {
    spawn: spawnStub
  },
  [path.resolve(process.cwd(), 'test/.env.json')]: {
    BOB: 'COOL',
    NODE_ENV: 'dev',
    ANSWER: '42'
  },
  [path.resolve(process.cwd(), 'test/.env.js')]: {
    BOB: 'COOL',
    NODE_ENV: 'dev',
    ANSWER: '42'
  },
  'os': {
    homedir: () => userHomeDir
  }
})
const EnvCmd = lib.EnvCmd
const ParseArgs = lib.ParseArgs
const ParseEnvString = lib.ParseEnvString
const PrintHelp = lib.PrintHelp
const HandleUncaughtExceptions = lib.HandleUncaughtExceptions
const StripComments = lib.StripComments
const StripEmptyLines = lib.StripEmptyLines
const ParseEnvVars = lib.ParseEnvVars
const ResolveEnvFilePath = lib.ResolveEnvFilePath

describe('env-cmd', function () {
  describe('ParseArgs', function () {
    it('should parse out --no-override option ', function () {
      const parsedArgs = ParseArgs(['--no-override', './test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.noOverride === true)
    })

    it('should parse out the envfile', function () {
      const parsedArgs = ParseArgs(['./test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.envFile === './test/envFile')
    })

    it('should parse out the command', function () {
      const parsedArgs = ParseArgs(['./test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.command === 'command')
    })

    it('should parse out the command args', function () {
      const parsedArgs = ParseArgs(['./test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.commandArgs.length === 2)
      assert(parsedArgs.commandArgs[0] === 'cmda1')
      assert(parsedArgs.commandArgs[1] === 'cmda2')
    })

    it('should error out if incorrect number of args passed', function () {
      try {
        ParseArgs(['./test/envFile'])
      } catch (e) {
        assert(e.message === 'Error! Too few arguments passed to env-cmd.')
        return
      }
      assert(!'No exception thrown')
    })
  })

  describe('ParseEnvString', function () {
    it('should parse env vars and merge (overwrite) with process.env vars', function () {
      const env = ParseEnvString('BOB=COOL\nNODE_ENV=dev\nANSWER=42\n')
      assert(env.BOB === 'COOL')
      assert(env.NODE_ENV === 'dev')
      assert(env.ANSWER === '42')
    })
  })

  describe('StripComments', function () {
    it('should strip out all full line comments', function () {
      const envString = StripComments('#BOB=COOL\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n#AnotherComment\n')
      assert(envString === '\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n\n')
    })
  })

  describe('StripEmptyLines', function () {
    it('should strip out all empty lines', function () {
      const envString = StripEmptyLines('\nBOB=COOL\n\nNODE_ENV=dev\n\nANSWER=42 AND COUNTING\n\n')
      assert(envString === 'BOB=COOL\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n')
    })
  })

  describe('ParseEnvVars', function () {
    it('should parse out all env vars in string when not ending with \'\\n\'', function () {
      const envVars = ParseEnvVars('BOB=COOL\nNODE_ENV=dev\nANSWER=42 AND COUNTING')
      assert(envVars.BOB === 'COOL')
      assert(envVars.NODE_ENV === 'dev')
      assert(envVars.ANSWER === '42 AND COUNTING')
    })

    it('should parse out all env vars in string with format \'key=value\'', function () {
      const envVars = ParseEnvVars('BOB=COOL\nNODE_ENV=dev\nANSWER=42 AND COUNTING\n')
      assert(envVars.BOB === 'COOL')
      assert(envVars.NODE_ENV === 'dev')
      assert(envVars.ANSWER === '42 AND COUNTING')
    })

    it('should ignore invalid lines', function () {
      const envVars = ParseEnvVars('BOB=COOL\nTHISIS$ANDINVALIDLINE\nANSWER=42 AND COUNTING\n')
      assert(Object.keys(envVars).length === 2)
      assert(envVars.BOB === 'COOL')
      assert(envVars.ANSWER === '42 AND COUNTING')
    })

    it('should default an empty value to an empty string', function () {
      const envVars = ParseEnvVars('EMPTY=\n')
      assert(envVars.EMPTY === '')
    })

    it('should escape double quoted values', function () {
      const envVars = ParseEnvVars('DOUBLE_QUOTES="double_quotes"\n')
      assert(envVars.DOUBLE_QUOTES === 'double_quotes')
    })

    it('should escape single quoted values', function () {
      const envVars = ParseEnvVars('SINGLE_QUOTES=\'single_quotes\'\n')
      assert(envVars.SINGLE_QUOTES === 'single_quotes')
    })

    it('should preserve embedded double quotes', function () {
      const envVars = ParseEnvVars('DOUBLE=""""\nDOUBLE_ONE=\'"double_one"\'\nDOUBLE_TWO=""double_two""\n')
      assert(envVars.DOUBLE === '""')
      assert(envVars.DOUBLE_ONE === '"double_one"')
      assert(envVars.DOUBLE_TWO === '"double_two"')
    })

    it('should preserve embedded single quotes', function () {
      const envVars = ParseEnvVars('SINGLE=\'\'\'\'\nSINGLE_ONE=\'\'single_one\'\'\nSINGLE_TWO="\'single_two\'"\n')
      assert(envVars.SINGLE === '\'\'')
      assert(envVars.SINGLE_ONE === '\'single_one\'')
      assert(envVars.SINGLE_TWO === '\'single_two\'')
    })
  })

  describe('JSON and JS format support', function () {
    before(function () {
      this.readFileStub = sinon.stub(fs, 'readFileSync')
      proxyquire.noCallThru()
    })
    after(function () {
      this.readFileStub.restore()
      proxyquire.callThru()
    })
    afterEach(function () {
      spawnStub.reset()
    })
    it('should parse env vars from JSON with node module loader if file extension is .json', function () {
      EnvCmd(['./test/.env.json', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'dev')
      assert(spawnStub.args[0][2].env.ANSWER === '42')
    })
    it('should parse env vars from JavaScript with node module loader if file extension is .js', function () {
      EnvCmd(['./test/.env.js', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'dev')
      assert(spawnStub.args[0][2].env.ANSWER === '42')
    })
  })

  describe('.RC file support (.env-cmdrc)', function () {
    before(function () {
      this.readFileStub = sinon.stub(fs, 'readFileSync')
      this.readFileStub.returns(`{
        "development": {
          "BOB": "COOL",
          "NODE_ENV": "dev",
          "ANSWER": "42",
          "TEST_CASES": true
        },
        "production": {
          "BOB": "COOL",
          "NODE_ENV": "prod",
          "ANSWER": "43"
        }
      }`)
      this.existsSyncStub = sinon.stub(fs, 'existsSync')
      this.existsSyncStub.returns(true)
      proxyquire.noCallThru()
    })
    after(function () {
      this.readFileStub.restore()
      this.existsSyncStub.restore()
      proxyquire.callThru()
    })
    afterEach(function () {
      spawnStub.reset()
    })
    it('should parse env vars from .env-cmdrc file using development env', function () {
      EnvCmd(['development', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'dev')
      assert(spawnStub.args[0][2].env.ANSWER === '42')
    })

    it('should parse env vars from .env-cmdrc file using production env', function () {
      EnvCmd(['production', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'prod')
      assert(spawnStub.args[0][2].env.ANSWER === '43')
    })

    it('should throw error if env not in .rc file', function () {
      try {
        EnvCmd(['staging', 'echo', '$BOB'])
        assert(!'Should throw missing environment error.')
      } catch (e) {
        assert(e.message.includes('staging'))
        assert(e.message.includes(`.env-cmdrc`))
      }
    })

    it('should parse env vars from .env-cmdrc file using both development and production env', function () {
      EnvCmd(['development,production', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'prod')
      assert(spawnStub.args[0][2].env.ANSWER === '43')
      assert(spawnStub.args[0][2].env.TEST_CASES === true)
    })

    it('should parse env vars from .env-cmdrc file using both development and production env in reverse order', function () {
      EnvCmd(['production,development', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'dev')
      assert(spawnStub.args[0][2].env.ANSWER === '42')
      assert(spawnStub.args[0][2].env.TEST_CASES === true)
    })

    it('should not fail if only one environment name exists', function () {
      EnvCmd(['production,test', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'prod')
      assert(spawnStub.args[0][2].env.ANSWER === '43')
    })

    it('should throw error if .rc file is not valid JSON', function () {
      this.readFileStub.returns(`{
        "development": {
          "BOB": "COOL",
          "NODE_ENV": "dev",
          "ANSWER": "42"
        },
        "production": {
          "BOB": 'COOL',
          "NODE_ENV": "prod",
          "ANSWER": "43"
        }
      }`)
      try {
        EnvCmd(['staging', 'echo', '$BOB'])
        assert(!'Should throw invalid JSON error.')
      } catch (e) {
        assert(e.message.includes(`.env-cmdrc`))
        assert(e.message.includes(`parse`))
        assert(e.message.includes(`JSON`))
      }
    })
  })

  describe('EnvCmd', function () {
    before(function () {
      this.readFileStub = sinon.stub(fs, 'readFileSync')
    })
    after(function () {
      this.readFileStub.restore()
    })
    afterEach(function () {
      spawnStub.reset()
      this.readFileStub.reset()
    })
    it('should spawn a new process with the env vars set', function () {
      this.readFileStub.returns('BOB=COOL\nNODE_ENV=dev\nANSWER=42\n')
      EnvCmd(['./test/.env', 'echo', '$BOB'])
      assert(this.readFileStub.args[0][0] === path.join(process.cwd(), 'test/.env'))
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'dev')
      assert(spawnStub.args[0][2].env.ANSWER === '42')
    })

    it('should spawn a new process without overriding shell env vars', function () {
      process.env.NODE_ENV = 'development'
      process.env.BOB = 'SUPERCOOL'
      this.readFileStub.returns('BOB=COOL\nNODE_ENV=dev\nANSWER=42\n')
      EnvCmd(['--no-override', './test/.env', 'echo', '$BOB'])
      assert(this.readFileStub.args[0][0] === path.join(process.cwd(), 'test/.env'))
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'SUPERCOOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'development')
      assert(spawnStub.args[0][2].env.ANSWER === '42')
    })

    it('should throw error if file and fallback does not exist with --fallback option', function () {
      this.readFileStub.restore()

      try {
        EnvCmd(['--fallback', './test/.non-existent-file', 'echo', '$BOB'])
      } catch (e) {
        const resolvedPath = path.join(process.cwd(), '.env')
        assert(e.message === `Error! Could not find fallback file or read env file at ${resolvedPath}`)
        return
      }
      assert(!'No exception thrown')
    })

    it('should execute successfully if no env file found', function () {
      this.readFileStub.restore()
      process.env.NODE_ENV = 'dev'
      process.env.ANSWER = '42'
      delete process.env.BOB

      EnvCmd(['./test/.non-existent-file', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === undefined)
      assert(spawnStub.args[0][2].env.NODE_ENV === 'dev')
      assert(spawnStub.args[0][2].env.ANSWER === '42')
    })
  })

  describe('PrintHelp', function () {
    it('should return help text when run', function () {
      const helpText = PrintHelp()
      assert(typeof helpText === 'string')
      assert(helpText.match(/Usage/g).length !== 0)
      assert(helpText.match(/env-cmd/).length !== 0)
      assert(helpText.match(/env_file/).length !== 0)
      assert(helpText.match(/env_name/).length !== 0)
    })
  })

  describe('HandleUncaughtExceptions', function () {
    beforeEach(function () {
      this.logStub = sinon.stub(console, 'log')
      this.processStub = sinon.stub(process, 'exit')
    })
    afterEach(function () {
      this.logStub.restore()
      this.processStub.restore()
    })
    it('should print help text and error if error contains \'passed\'', function () {
      HandleUncaughtExceptions(new Error('print help text passed now'))
      assert(this.logStub.calledTwice)
      this.logStub.restore()  // restore here so test success logs get printed
    })

    it('should print just there error if error does not contain \'passed\'', function () {
      HandleUncaughtExceptions(new Error('do not print help text now'))
      assert(this.logStub.calledOnce)
      this.logStub.restore()  // restore here so test success logs get printed
    })
  })

  describe('ResolveEnvFilePath', function () {
    beforeEach(function () {
      this.cwdStub = sinon.stub(process, 'cwd')
      this.cwdStub.returns('/Users/hitchhikers-guide-to-the-galaxy/Thanks')
    })
    afterEach(function () {
      this.cwdStub.restore()
    })
    it('should add "fish.env" to the end of the current directory', function () {
      const abPath = ResolveEnvFilePath('fish.env')
      assert(abPath === '/Users/hitchhikers-guide-to-the-galaxy/Thanks/fish.env')
    })
    it('should add "./fish.env" to the end of the current directory', function () {
      const abPath = ResolveEnvFilePath('./fish.env')
      assert(abPath === '/Users/hitchhikers-guide-to-the-galaxy/Thanks/fish.env')
    })
    it('should add "../fish.env" to the end of the current directory', function () {
      const abPath = ResolveEnvFilePath('../fish.env')
      assert(abPath === '/Users/hitchhikers-guide-to-the-galaxy/fish.env')
    })
    it('should add "for-all-the/fish.env" to the end of the current directory', function () {
      const abPath = ResolveEnvFilePath('for-all-the/fish.env')
      assert(abPath === '/Users/hitchhikers-guide-to-the-galaxy/Thanks/for-all-the/fish.env')
    })
    it('should set the absolute path to "/thanks/for-all-the/fish.env"', function () {
      const abPath = ResolveEnvFilePath('/thanks/for-all-the/fish.env')
      assert(abPath === '/thanks/for-all-the/fish.env')
    })
    it('should use "~" to add "fish.env" to the end of user directory', function () {
      const abPath = ResolveEnvFilePath('~/fish.env')
      assert(abPath === '/Users/hitchhikers-guide-to-the-galaxy/fish.env')
    })
    it('should leave "~" in path if no user home directory found', function () {
      userHomeDir = ''
      const abPath = ResolveEnvFilePath('~/fish.env')
      assert(abPath === '/Users/hitchhikers-guide-to-the-galaxy/Thanks/~/fish.env')
    })
  })
})
