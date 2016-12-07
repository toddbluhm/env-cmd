[![Travis](https://img.shields.io/travis/toddbluhm/env-cmd.svg)](https://travis-ci.org/toddbluhm/env-cmd)
[![Coveralls](https://img.shields.io/coveralls/toddbluhm/env-cmd.svg)](https://coveralls.io/github/toddbluhm/env-cmd)
[![npm](https://img.shields.io/npm/v/env-cmd.svg?maxAge=86400)](https://www.npmjs.com/package/env-cmd)
[![npm](https://img.shields.io/npm/dm/env-cmd.svg?maxAge=86400)](https://www.npmjs.com/package/env-cmd)
[![npm](https://img.shields.io/npm/l/env-cmd.svg?maxAge=2592000)](https://www.npmjs.com/package/env-cmd)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# env-cmd
A simple node program for executing commands using an environment from an env file.

## Install
`npm install env-cmd` or `npm install -g env-cmd`

## Usage

### Environment File Usage

**Environment file `./test/.env`**
```
# This is a comment
ENV1=THANKS # Yay inline comments support
ENV2=FOR ALL
ENV3 THE FISH # This format is also accepted

# Surround value in double quotes when using a # symbol in the value
ENV4="ValueContains#Symbol"

# If using double quotes as part of the value, you must surround the value in double quotes
ENV5=""Value includes double quotes""
```

**Package.json**
```json
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

### .rc file usage

**.rc file `.env-cmdrc`**

```json
{
  "development": {
    "ENV1": "Thanks",
    "ENV2": "For All"
  },
  "production": {
    "ENV1": "The Fish"
  }
}
```

**Terminal**
```sh
./node_modules/.bin/env-cmd production node index.js
```

## Environment File Formats

These are the currently accepted environment file formats. If any other formats are desired please create an issue.
- `key=value`
- `key value`
- Key/value pairs as JSON
- JavaScript file exporting an object
- `.env-cmdrc` file (as valid json) in execution directory

## Why

Because sometimes its just too cumbersome passing lots of environment variables to scripts. Its usually just easier to have a file with all the vars in them, especially for development and testing.

**Do not commit sensitive environment data to a public git repo!**

## Related Projects

[`cross-env`](https://github.com/kentcdodds/cross-env) - Cross platform setting of environment scripts

## Special Thanks

Special thanks to [`cross-env`](https://github.com/kentcdodds/cross-env) for inspiration (use's the same `cross-spawn` lib underneath too).

## Contributors

- Eric Lanehart
- Jon Scheiding

## Contributing Guide
I welcome all pull requests. Please make sure you add appropriate test cases for any features added. Before opening a PR please make sure to run the following scripts:

- `npm run lint` checks for code errors and formats according to [js-standard](https://github.com/feross/standard)
- `npm test` make sure all tests pass
- `npm run test-cover` make sure the coverage has not decreased from current master
