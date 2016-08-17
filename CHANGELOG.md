# Changelog

## 2.0.0
- BREAKING: Removed the `-e` and `--env` flags! Now it just expects the first arg to `env-cmd` to be the relative path to the env file: `env-cmd env_file command carg1 carg2`
- Changed ParseEnvFile over to more generic name: ParseEnvString
- ParseEnvString: Ignore comment lines (lines starting with '#')
- ParseEnvString: Ignore empty lines in env file

## 1.0.1
- Fixed badges
- Added .npmignore
- Added help text to be printed out on certain errors
- Handled uncaught errors nicely

## 1.0.0
- Initial release
