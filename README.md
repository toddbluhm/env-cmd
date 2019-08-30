[![Travis](https://travis-ci.org/toddbluhm/env-cmd.svg?branch=master)](https://travis-ci.org/toddbluhm/env-cmd)
[![Coverage Status](https://coveralls.io/repos/github/toddbluhm/env-cmd/badge.svg?branch=master)](https://coveralls.io/github/toddbluhm/env-cmd?branch=master)
[![npm](https://img.shields.io/npm/v/env-cmd.svg?maxAge=86400)](https://www.npmjs.com/package/env-cmd)
[![npm](https://img.shields.io/npm/dm/env-cmd.svg?maxAge=86400)](https://www.npmjs.com/package/env-cmd)
[![npm](https://img.shields.io/npm/l/env-cmd.svg?maxAge=2592000)](https://www.npmjs.com/package/env-cmd)
[![TS-Standard - Typescript Standard Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/toddbluhm/ts-standard)
[![Greenkeeper badge](https://badges.greenkeeper.io/toddbluhm/env-cmd.svg)](https://greenkeeper.io/)

# env-cmd

A simple node program for executing commands using an environment from an env file.

## Install

`npm install env-cmd` or `npm install -g env-cmd`

## Basic Usage

**Environment file `./.env`**

```text
# This is a comment
ENV1=THANKS
ENV2=FOR ALL
ENV3=THE FISH
```

**Package.json**

```json
{
  "scripts": {
    "test": "env-cmd mocha -R spec"
  }
}
```

**Terminal**

```sh
./node_modules/.bin/env-cmd node index.js
```

## Using custom env file path

To use a custom env filename or path, pass the `-f` flag. This is a major breaking change from prior versions < 9.0.0

**Terminal**

```sh
./node_modules/.bin/env-cmd -f ./custom/path/.env node index.js
```

## 📜 Help

```text
Usage: _ [options] <command> [...args]

Options:
  -v, --version                       output the version number
  -f, --file [path]                   Custom env file path (default path: ./.env)
  -r, --rc-file [path]                Custom rc file path (default path: ./.env-cmdrc(|.js|.json)
  -e, --environments [env1,env2,...]  The rc file environment(s) to use
  --fallback                          Fallback to default env file path, if custom env file path not found
  --no-override                       Do not override existing environment variables
  --use-shell                         Execute the command in a new shell with the given environment
  -h, --help                          output usage information
```

## 🔬 Advanced Usage

### `.rc` file usage

For more complex projects, a `.env-cmdrc` file can be defined in the root directory and supports
as many environments as you want. Simply use the `-e` flag and provide which environments you wish to
use from the `.env-cmdrc` file. Using multiple environment names will merge the environment variables
together. Later environments overwrite earlier ones in the list if conflicting environment variables
are found.

**.rc file `./.env-cmdrc`**

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
./node_modules/.bin/env-cmd -e production node index.js
# Or for multiple environments (where `production` vars override `test` vars,
# but both are included)
./node_modules/.bin/env-cmd -e test,production node index.js
```

### `--no-override` option

Prevents overriding of existing environment variables on `process.env` and within the current
environment.

### `--fallback` file usage option

If the `.env` file does not exist at the provieded custom path, then use the default
fallback location `./.env` env file instead.

### `--use-shell`

Executes the command within a new shell environment. This is useful if you want to string multiple
commands together that share the same environment variables.

**Terminal**

```sh
./node_modules/.bin/env-cmd -f ./test/.env --use-shell "npm run lint && npm test"
```

### Asynchronous env file support

EnvCmd supports reading from asynchronous `.env` files. Instead of using a `.env` file, pass in a `.js`
file that exports either an object or a `Promise` resolving to an object (`{ ENV_VAR_NAME: value, ... }`). Asynchronous `.rc`
files are also supported using `.js` file extension and resolving to an object with top level environment
names (`{ production: { ENV_VAR_NAME: value, ... } }`).

**Terminal**

```sh
./node_modules/.bin/env-cmd -f ./async-file.js node index.js
```

## Examples

You can find examples of how to use the various options above by visiting
the examples repo [env-cmd-examples](https://github.com/toddbluhm/env-cmd-examples).

## Environment File Formats

These are the currently accepted environment file formats. If any other formats are desired please create an issue.

- `.env` as `key=value`
- `.env.json` Key/value pairs as JSON
- `.env.js` JavaScript file exporting an `object` or a `Promise` that resolves to an `object`
- `.env-cmdrc` as valid json or `.env-cmdrc.json` in execution directory with at least one environment `{ "dev": { "key1": "val1" } }`
- `.env-cmdrc.js` JavaScript file exporting an `object` or a `Promise` that resolves to an `object` that contains at least one environment

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

## ⚒ API Usage

### `EnvCmd`

A function that executes a given command in a new child process with the given environment and options

- **`options`** { `object` }
  - **`command`** { `string` }: The command to execute (`node`, `mocha`, ...)
  - **`commandArgs`** { `string[]` }: List of arguments to pass to the `command` (`['-R', 'Spec']`)
  - **`envFile`** { `object` }
    - **`filePath`** { `string` }: Custom path to .env file to read from (defaults to: `./.env`)
    - **`fallback`** { `boolean` }: Should fall back to default `./.env` file if custom path does not exist
  - **`rc`** { `object` }
    - **`environments`** { `string[]` }: List of environment to read from the `.rc` file
    - **`filePath`** { `string` }: Custom path to the `.rc` file (defaults to: `./.env-cmdrc(|.js|.json)`)
  - **`options`** { `object` }
    - **`noOverride`** { `boolean` }: Prevent `.env` file vars from overriding existing `process.env` vars (default: `false`)
    - **`useShell`** { `boolean` }: Runs command inside a new shell instance (default: `false`)
  - **Returns** { `Promise<object>` }: key is env var name and value is the env var value

### `GetEnvVars`

A function that parses environment variables from a `.env` or a `.rc` file

- **`options`** { `object` }
  - **`envFile`** { `object` }
    - **`filePath`** { `string` }: Custom path to .env file to read from (defaults to: `./.env`)
    - **`fallback`** { `boolean` }: Should fall back to default `./.env` file if custom path does not exist
  - **`rc`** { `object` }
    - **`environments`** { `string[]` }: List of environment to read from the `.rc` file
    - **`filePath`** { `string` }: Custom path to the `.rc` file (defaults to: `./.env-cmdrc(|.js|.json)`)
- **Returns** { `Promise<object>` }: key is env var name and value is the env var value

## Why

Because sometimes it is just too cumbersome passing a lot of environment variables to scripts. It is
usually just easier to have a file with all the vars in them, especially for development and testing.

🚨**Do not commit sensitive environment data to a public git repo!** 🚨

## Related Projects

[`cross-env`](https://github.com/kentcdodds/cross-env) - Cross platform setting of environment scripts

## 🎊 Special Thanks

Special thanks to [`cross-env`](https://github.com/kentcdodds/cross-env) for inspiration (uses the
same `cross-spawn` lib underneath too).

## 🎉 Contributors

- Eric Lanehart
- Jon Scheiding
- Alexander Praetorius
- Anton Versal

## 📋 Contributing Guide

I welcome all pull requests. Please make sure you add appropriate test cases for any features
added. Before opening a PR please make sure to run the following scripts:

- `npm run lint` checks for code errors and format according to [js-standard](https://github.com/feross/standard)
- `npm test` make sure all tests pass
- `npm run test-cover` make sure the coverage has not decreased from current master
