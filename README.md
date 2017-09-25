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

## Basic Usage

**Environment file `./test/.env`**
```
# This is a comment
ENV1=THANKS
ENV2=FOR ALL
ENV3=THE FISH
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

## Advanced Usage

### `--fallback` file usage option

You can specify an `.env.local` (or any name) env file, add that to your `.gitignore` and use that in your local development environment. Then you can use a regular `.env` file in root directory with production configs that can get committed to a private/protected repo. When `env-cmd` cannot find the `.env.local` file it will fallback to looking for a regular `.env` file.

**Environment file `./.env.local`**
```
# This is a comment
ENV1=THANKS
ENV2=FOR ALL
ENV3=THE FISH
```
**Fallback Environment file `./.env`**
```
# This can be used as an example fallback
ENV1=foo
ENV2=bar
ENV3=baz
ENV4=quux
ENV5=gorge
```

**Package.json**
uses `./.env` as a fallback
```json
{
  "scripts": {
    "test": "env-cmd --fallback ./.env.local mocha -R spec"
  }
}
```
or

**Terminal**
```sh
# uses ./.env as a fallback, because it can't find `./.env.local`
./node_modules/.bin/env-cmd ./.env.local node index.js
```

### `.rc` file usage

For more complex projects, a `.env-cmdrc` file can be defined in the root directory and supports as many environments as you want. Instead of passing the path to a `.env` file to `env-cmd`, simply pass the name of the environment you want to use thats in your `.env-cmdrc` file. You may also use multiple environment names to merge env vars together.

**.rc file `.env-cmdrc`**

```json
{
  "development": {
    "ENV1": "Thanks",
    "ENV2": "For All"
  },
  "test": {
    "ENV1": "No Thanks",
    "ENV3": "!"
  },
  "production": {
    "ENV1": "The Fish"
  }
}
```

**Terminal**
```sh
./node_modules/.bin/env-cmd production node index.js
# Or for multiple environments (where `production` vars override `test` vars,
# but both are included)
./node_modules/.bin/env-cmd test,production node index.js
```

### `--no-override` option

Sometimes you want to set env variables from a file without overriding existing process env vars or shell env vars.

**Terminal**
```sh
ENV1=welcome ./node_modules/.bin/env-cmd --no-override ./test/.env node index.js
```
## Environment File Formats

These are the currently accepted environment file formats. If any other formats are desired please create an issue.
- `key=value`
- Key/value pairs as JSON
- JavaScript file exporting an object
- `.env-cmdrc` file (as valid json) in execution directory

## Path Rules

This lib attempts to follow standard `bash` path rules. The rules are as followed:

Home Directory = `/Users/test`

Working Directory = `/Users/test/Development/app`

| Type | Input Path | Expanded Path |
| -- | -- | ------------- |
| Absolute | `/some/absolute/path.env` | `/some/absolute/path.env` |
| Home Directory with `~` | `~/starts/on/homedir/path.env` | `/Users/test/starts/on/homedir/path.env` |
| Relative | `./some/relative/path.env` or `some/relative/path.env` | `/Users/test/Development/app/some/relative/path.env` |
| Relative with parent dir | `../some/relative/path.env` | `/Users/test/Development/some/relative/path.env` |

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
- Alexander Praetorius
- Anton Versal

## Contributing Guide
I welcome all pull requests. Please make sure you add appropriate test cases for any features added. Before opening a PR please make sure to run the following scripts:

- `npm run lint` checks for code errors and formats according to [js-standard](https://github.com/feross/standard)
- `npm test` make sure all tests pass
- `npm run test-cover` make sure the coverage has not decreased from current master
