[![Travis](https://img.shields.io/travis/toddbluhm/env-cmd.svg?maxAge=2592000)](https://travis-ci.org/toddbluhm/env-cmd)
[![Coveralls](https://img.shields.io/coveralls/toddbluhm/env-cmd.svg?maxAge=2592000)](https://coveralls.io/github/toddbluhm/env-cmd)
[![npm](https://img.shields.io/npm/toddbluhm/env-cmd.svg?maxAge=2592000)](https://www.npmjs.com/package/env-cmd)
[![npm](https://img.shields.io/npm/toddbluhm/env-cmd.svg?maxAge=2592000)](https://www.npmjs.com/package/env-cmd)

# env-cmd
A simple node program for executing commands using an environment from an env file

## Install
`npm install env-cmd`

## Usage
**Environment file ``./test/.env`**
```
ENV1=THANKS
ENV2=FORALL
ENV4=THEFISH
```
*This is the only accepted format for an environment file. If other formats are desired please create an issue*

**Package.json**
```js
{
  "scripts": {
    "test": "env-cmd -e ./test/.env mocha -R spec"
  }
}
```
or

**Terminal**
```sh
./node_modules/.bin/env-cmd -e ./test/.env node index.js
```

## Why

Because sometimes it just too cumbersome passing tons of environment variables to scripts. Its usually just easier to have a file with all the vars in them, especially for development.

**Do not commit sensitive data to a public git!**

## Special Thanks

Special thanks to [cross-env](https://github.com/kentcdodds/cross-env) for inspiration (use's the same `cross-spawn` lib underneath).
