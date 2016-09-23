'use strict'

const yargs = require('yargs')

function showUsage (errors) {
  console.error(`
    Usage:
      env-cmd .env node index.js
      env-cmd -e dev.env test.env -c node index.js
    Options:
      -e, --env-file  Env file(s) to load    [required]
      -c, --command   Command to execute     [required]

    ${errors.join('\n    ')}
  `);
}

function ParseArgs (args) {
  var argv = yargs.options({
    e: {
      alias: ['env-file', 'env-files', 'f', 'file', 'files'],
      type: 'array'
    },
    c: {
      alias: 'command',
      type: 'array'
    }
  }).argv

  let files = argv.e;
  let command = argv.c

  const errors = [];

  if (!files) {
    // check the un-flagged args
    if (argv._.length) {
      files = argv._
    } else {
      errors.push('Missing required arguments: env-file')
    }
  }

  if (!command) {
    if (!argv.e) {
      // if -e flag wasn't used, commands must be in the un-flagged args
      if (argv._.length < 2) {
        errors.push('Missing required arguments: command')
      } else {
        // if commands are supplied as unflagged args,
        // they must be the after the 1st arg,
        // and in that case the 1st arg must be the env-file.
        // Unflagged ars were already processed above and their contents in `files` variable.
        command = files.slice(1)
        files = [files[0]]
      }
    } else {
      errors.push('Missing required arguments: command')
    }
  }

  if (errors.length) {
    showUsage(errors);
    process.exit(1);
  }

  return { files, command }
}

module.exports = ParseArgs;
