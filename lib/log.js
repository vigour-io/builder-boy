const fs = require('fs')
const chalk = require('chalk')

const showcode = (str, start, end) => { // eslint-disable-line
  if (typeof start === 'object') {
    if (start.end) {
      showcode(str, start.start, start.end)
    } else {
      for (let i in start) {
        showcode(str, start[i].start, start[i].end)
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

const parseJSONError = (raw, err) => {
  var line = err.message.match(/position (\d+)$/)
  if (line) {
    let index = line[1] * 1 + 1
    err.message += parseCharIndex(raw, index)
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

const parseCharIndex = (str, index, end) => {
  if (!end) end = index + 1
  let cnt = 0
  const lines = str.split('\n')
  for (let i = 0; i < lines.length; i++) {
    cnt += (lines[i].length + 1)
    if (index <= cnt) {
      return ` (${i + 1}:${Math.max(cnt - index, 0)})`
    }
  }
}

const logTypeChain = node => {
  var p = node
  const arr = []
  while (p) {
    arr.push(p.type)
    p = p.parent
  }
  console.log(arr)
  return arr
}

exports.logError = logError
exports.fill = fill
exports.showcode = showcode
exports.parseCharIndex = parseCharIndex
exports.parseJSONError = parseJSONError
exports.logTypeChain = logTypeChain
