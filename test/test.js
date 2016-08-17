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

const spawnStub = sinon.spy(() => ({
  on: sinon.stub(),
  exit: sinon.stub()
}))

const lib = proxyquire('../lib', {
  'cross-spawn': {
    spawn: spawnStub
  }
})
const EnvCmd = lib.EnvCmd
const ParseArgs = lib.ParseArgs
const ParseEnvString = lib.ParseEnvString
const PrintHelp = lib.PrintHelp
const HandleUncaughtExceptions = lib.HandleUncaughtExceptions

describe('env-cmd', function () {
  describe('ParseArgs', function () {
    it('should parse out the -e envfile path', function () {
      const parsedArgs = ParseArgs(['./test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.envFilePath === path.join(__dirname, 'envFile'))
    })

    it('should parse out the --env envfile path', function () {
      const parsedArgs = ParseArgs(['./test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.envFilePath === path.join(__dirname, 'envFile'))
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
    it('should parse out vars in the environment variable string', function () {
      const env = ParseEnvString('BOB=COOL\nNODE_ENV=dev\nANSWER=42\n')
      assert(env.BOB === 'COOL')
      assert(env.NODE_ENV === 'dev')
      assert(env.ANSWER === '42')
    })

    it('should ignore comment lines (starting with \'#\') and empty lines', function () {
      const env = ParseEnvString('#BOB=COOL\nNODE_ENV=dev\n\n#ANSWER=42\n')
      assert(env.BOB === undefined)
      assert(env.NODE_ENV === 'dev')
      assert(env.ANSWER === undefined)
    })

    it('should parse out env vars even if string does not end in \'\\n\'', function () {
      const env = ParseEnvString('BOB=COOL\nNODE_ENV=dev\nANSWER=42')
      assert(env.BOB === 'COOL')
      assert(env.NODE_ENV === 'dev')
      assert(env.ANSWER === '42')
    })

    it('should throw parse error due to malformed env var string', function () {
      try {
        ParseEnvString('BOB=COOL\nNODE_ENV dev\nANSWER=42\n')
      } catch (e) {
        assert(e.message === 'Error! Malformed line in env file.')
        return
      }
      assert(!'No exception thrown')
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

    it('should throw error if file does not exist', function () {
      this.readFileStub.restore()
      try {
        EnvCmd(['./test/.non-existent-file', 'echo', '$BOB'])
      } catch (e) {
        const resolvedPath = path.join(process.cwd(), 'test/.non-existent-file')
        assert(e.message === `Error! Could not find or read file at ${resolvedPath}`)
        return
      }
      assert(!'No exception thrown')
    })
  })

  describe('PrintHelp', function () {
    it('should return help text when run', function () {
      const helpText = PrintHelp()
      assert(typeof helpText === 'string')
      assert(helpText.match(/Usage/g).length !== 0)
      assert(helpText.match(/env-cmd/).length !== 0)
      assert(helpText.match(/env_file/).length !== 0)
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
})
