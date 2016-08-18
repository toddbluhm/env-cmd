# Changelog

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
