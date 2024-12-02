/* eslint @typescript-eslint/no-non-null-assertion: 0 */
import { assert } from 'chai'
import { expandEnvs } from '../src/expand-envs.js'

describe('expandEnvs', (): void => {
  const envs = {
    notvar: 'this is not used',
    dollar: 'money',
    PING: 'PONG',
    IP1: '127.0.0.1',
    THANKSFORALLTHEFISH: 42,
    BRINGATOWEL: true,
  }
  const args = ['notvar', '$dollar', '\\$notvar', '-4', '$PING', '$IP1', '\\$IP1', '$NONEXIST']
  const argsExpanded = ['notvar', 'money', '\\$notvar', '-4', 'PONG', '127.0.0.1', '\\$IP1', '$NONEXIST']

  it('should replace environment variables in args', (): void => {
    const res = args.map(arg => expandEnvs(arg, envs))
    assert.sameOrderedMembers(res, argsExpanded)
    for (const arg of args) {
      assert.typeOf(arg, 'string')
    }
  })
})
