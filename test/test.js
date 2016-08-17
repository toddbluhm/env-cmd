'use strict'

const assert = require('better-assert')
const describe = require('mocha').describe
const it = require('mocha').it
const afterEach = require('mocha').afterEach
const path = require('path')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

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
const ParseEnvFile = lib.ParseEnvFile

describe('env-cmd', function () {
  describe('ParseArgs', function () {
    it('should parse out the -e envfile path', function () {
      const parsedArgs = ParseArgs(['-e', './test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.envFilePath === path.join(__dirname, 'envFile'))
    })

    it('should parse out the --env envfile path', function () {
      const parsedArgs = ParseArgs(['--env', './test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.envFilePath === path.join(__dirname, 'envFile'))
    })

    it('should parse out the command', function () {
      const parsedArgs = ParseArgs(['-e', './test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.command === 'command')
    })

    it('should parse out the command args', function () {
      const parsedArgs = ParseArgs(['-e', './test/envFile', 'command', 'cmda1', 'cmda2'])
      assert(parsedArgs.commandArgs.length === 2)
      assert(parsedArgs.commandArgs[0] === 'cmda1')
      assert(parsedArgs.commandArgs[1] === 'cmda2')
    })

    it('should error out if incorrect number of args passed', function () {
      try {
        ParseArgs(['-e', './test/envFile'])
      } catch (e) {
        assert(e.message === 'Too few arguments passed to envCmd.')
        return
      }
      assert(!'No exepection thrown')
    })

    it('should error out if no envFile flag found', function () {
      try {
        ParseArgs(['./test/envFile', 'command', 'cmda1', 'cmda2'])
      } catch (e) {
        assert(e.message === 'Error, No -e or --env flag passed.')
        return
      }
      assert(!'No exepection thrown')
    })
  })

  describe('ParseEnvFile', function () {
    it('should parse out vars in the environment variable file', function () {
      const env = ParseEnvFile(path.join(__dirname, '/.env'))
      assert(env.BOB === 'COOL')
      assert(env.NODE_ENV === 'dev')
      assert(env.NICE === '42')
    })

    it('should parse out vars in the environment variable file', function () {
      try {
        ParseEnvFile(path.join(__dirname, '/.env-malformed'))
      } catch (e) {
        assert(e.message === 'Error, Malformed line in .env-malformed.')
        return
      }
      assert(!'No exepection thrown')
    })
  })

  describe('EnvCmd', function () {
    afterEach(function () {
      spawnStub.reset()
    })
    it('should spawn a new process with the env vars set', function () {
      EnvCmd(['-e', './test/.env', 'echo', '$BOB'])
      assert(spawnStub.args[0][0] === 'echo')
      assert(spawnStub.args[0][1][0] === '$BOB')
      assert(spawnStub.args[0][2].env.BOB === 'COOL')
      assert(spawnStub.args[0][2].env.NODE_ENV === 'dev')
      assert(spawnStub.args[0][2].env.NICE === '42')
    })
  })
})
