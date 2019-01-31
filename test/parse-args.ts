// import * as assert from 'better-assert'
// import * as path from 'path'
// import * as proxyquire from 'proxyquire'
// import * as sinon from 'sinon'
// import * as fs from 'fs'
// import { parseArgs } from '../src/parse-args'

// let userHomeDir = '/Users/hitchhikers-guide-to-the-galaxy'
// const spawnStub = sinon.spy(() => ({
//   on: sinon.stub(),
//   exit: sinon.stub(),
//   kill: sinon.stub()
// }))

// describe('env-cmd', function () {
//   describe('parseArgs', function () {
//     it('should parse out --no-override option ', function () {
//       const parsedArgs = parseArgs(['--no-override', './test/envFile', 'command', 'cmda1', 'cmda2'])
//       assert(parsedArgs.options.noOverride === true)
//     })

//     it('should parse out the envfile', function () {
//       const parsedArgs = parseArgs(['-f', './test/envFile', 'command', 'cmda1', 'cmda2'])
//       assert(parsedArgs.envValues === './test/envFile')
//     })

//     it('should parse out the command', function () {
//       const parsedArgs = ParseArgs(['./test/envFile', 'command', 'cmda1', 'cmda2'])
//       assert(parsedArgs.command === 'command')
//     })

//     it('should parse out the command args', function () {
//       const parsedArgs = ParseArgs(['./test/envFile', 'command', 'cmda1', 'cmda2'])
//       assert(parsedArgs.commandArgs.length === 2)
//       assert(parsedArgs.commandArgs[0] === 'cmda1')
//       assert(parsedArgs.commandArgs[1] === 'cmda2')
//     })

//     it('should error out if incorrect number of args passed', function () {
//       try {
//         ParseArgs(['./test/envFile'])
//       } catch (e) {
//         assert(e.message === 'Error! Too few arguments passed to env-cmd.')
//         return
//       }
//       assert(!'No exception thrown')
//     })
//   })
// })
