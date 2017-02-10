const chalk = require('chalk')

const isExternal = file => file.get([ 'external', 'compute' ])

const isJSON = file => /\.json$/i.test(file.key)

const fs = require('fs')

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

const fill = (str, len) => (new Array(len)).join(str)

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

exports.parseCharIndex = parseCharIndex
exports.isExternal = isExternal
exports.isJSON = isJSON
exports.logError = logError
exports.fill = fill
