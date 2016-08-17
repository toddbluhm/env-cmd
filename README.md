[![Travis](https://img.shields.io/travis/toddbluhm/env-cmd.svg?maxAge=2592000)](https://travis-ci.org/toddbluhm/env-cmd)
[![Coveralls](https://img.shields.io/coveralls/toddbluhm/env-cmd.svg?maxAge=2592000)](https://coveralls.io/github/toddbluhm/env-cmd)
[![npm](https://img.shields.io/npm/v/env-cmd.svg?maxAge=2592000)](https://www.npmjs.com/package/env-cmd)
[![npm](https://img.shields.io/npm/dm/env-cmd.svg?maxAge=2592000)](https://www.npmjs.com/package/env-cmd)
[![npm](https://img.shields.io/npm/l/env-cmd.svg?maxAge=2592000)](https://www.npmjs.com/package/env-cmd)

# env-cmd
A simple node program for executing commands using an environment from an env file

## Install
`npm install env-cmd`

## Usage
**Environment file ``./test/.env`**
```
# This is a comment
ENV1=THANKS
ENV2=FORALL
ENV4=THEFISH
```
*This is the only accepted format for an environment file. If other formats are desired please create an issue*

**Package.json**
```js
{
  "scripts": {
    "test": "env-cmd ./test/.env mocha -R spec"
  }
}
```
or

**Terminal**
```sh
./node_modules/.bin/env-cmd ./test/.env node index.js
```

## Why

Because sometimes its just too cumbersome passing lots of environment variables to scripts. Its usually just easier to have a file with all the vars in them, especially for development and testing.

**Do not commit sensitive env data to a public git repo!**

## Special Thanks

Special thanks to [cross-env](https://github.com/kentcdodds/cross-env) for inspiration (use's the same `cross-spawn` lib underneath too).
