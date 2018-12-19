let output = ''
const write = process.stdout.write
const log = console.log
const warn = console.warn
const error = console.error

module.exports = {
  captureOutput: function() {
    output = ''
    process.stdout.write = console.log = console.warn = console.error = function(string) {
      if (!string) return
      output += string
    }
  },

  getOutput: function() {
    return output
  },

  restoreOutput: function() {
    process.stdout.write = write
    console.log = log
    console.warn = warn
    console.error = error
  }
}
