# Changelog

## 5.1.0
- **Feature**: Added new option `--no-override` that when passed will make it so that the env file
vars will not overwrite already defined env vars on `process.env` or in the shell
- **Updated Dev-Dependencies**: `standard >= 10.0.0`, `sinon >= 2.0.0`

## 5.0.0
- ***BREAKING***: Inline comments are no longer allowed in `.env` files (full line comments are still allowed)
- ***BREAKING***: `.env` file no longer supports the `env var` format (only `env=var` is allowed now)
- ***BREAKING***: Double Quotes are no longer needed when using special symbols (such as `#`) in the value portion of an env var
- **Feature**: if the given env file cannot be found, it will auto default to searching
the execution directory for a file called `.env` and use that as a fallback. See README for why this is
helpful. (special thanks to Alexander Praetorius)

## 4.0.0
- ***BREAKING***: In order to use double quotes as part of the env value, you must now surround those double quotes with an additional set of quotes: So `ENV1="value"` -> `ENV1=""value""` (this only applies to double quotes, single quotes continue to work as normal)
- **Bug**: Fixed bug in the comment stripper function that would remove env values that included a `#`. Now, in order to use a `#` in a env value, you have to surround that env value in double quotes: `ENV="Some#Value"`.
- **Bug**: Fixed a major bug with the `.env-cmdrc` file that would not add system env vars back in after reading the `.env-cmdrc` file. This meant that system vars like `PATH` would not exist when running the command.

## 3.0.0
- **Feature**: Added ability to use an `.env-cmdrc` file to hold multiple configs
- **Feature**: Added ability to pass in a regular `.js` file exporting an object for your env file (special thanks to Jon Scheiding!)
- **Change**: Updated core `cross-spawn` lib to 5.0.1

## 2.2.0
- **Feature**: Added support for .json env files (special thanks to Eric Lanehart!)

## 2.1.0
- **Feature**: Added support for `key value` mapping in env vars file
- **Feature**: Added support for inline comments `ENV=VALUE # inline comment`
- **Change**: Will now ignore invalid lines in env vars file instead of throwing an error
- **Change**: Migrated all the parsing over to regex since the file format is simple enough right
now to support that
- **Bug**: Removed old test cases for the `-e/--env` flags that were not needed anymore

## 2.0.0
- ***BREAKING***: Removed the `-e` and `--env` flags. Now it just expects the first arg to `env-cmd` to be the relative path to the env file: `env-cmd env_file command carg1 carg2`
- **Change:** `ParseEnvFile` is now more properly named `ParseEnvString`
- **Feature:** `ParseEnvString` will ignore comment lines (lines starting with `#`)
- **Feature:** `ParseEnvString` will ignore empty lines in env file
- **Bug:** `ParseEnvString` will extract the last line even if no newline (`\n`) exists on it

## 1.0.1
- Fixed badges
- Added .npmignore
- Added help text to be printed out on certain errors
- Handled uncaught errors nicely

## 1.0.0
- Initial release
