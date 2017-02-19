const fs = require('fs')
const chalk = require('chalk')

const code = (str, start, end) => { // eslint-disable-line
  if (typeof start === 'object') {
    if (start.end) {
      code(str, start.start, start.end)
    } else {
      for (let i in start) {
        code(str, start[i].start, start[i].end)
      }
    }
  } else {
    console.log(
      chalk.blue(str.slice(start - 50 > 0 ? start - 50 : 0, start)) +
      chalk.green(str.slice(start, end)) +
      chalk.blue(str.slice(end, end + 50 > str.length ? str.length : end + 50))
    )
  }
}

const fill = (str, len) => (new Array(len)).join(str)

// lines are ofcourse wrong --- need sourcemaps
const logError = (line, err) => {
  const nr = 1 * line[1]
  const char = 1 * line[2]
  const file = fs.readFileSync(err.file)
  const lines = file.toString().split('\n')
  lines.forEach((val, i) => {
    if (i > nr - 5 && i < nr + 5) {
      var linenr = i + ' '
      linenr = chalk.grey((fill(' ', 5 - linenr.length)) + linenr)
      if (i === nr - 1) {
        console.log(`   ${linenr} ${chalk.red(val)}`)
        console.log(`   ${fill(' ', char - 1 + 7)}${chalk.red('^')}`)
      } else {
        console.log(`   ${linenr} ${val}`)
      }
    }
  })
  console.log('\n')
}

exports.logError = logError
exports.fill = fill
exports.code = code
