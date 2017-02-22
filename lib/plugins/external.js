const exclude = require('../exclude')
const chalk = require('chalk')
const env = require('./env')

exports.condition = file => file.external || exclude(file)

exports.parse = file => new Promise((resolve, reject) => {
  const id = file.id.compute()
  if (exclude(file)) {
    const result = `var ${id} = require('${file.external || file.key}')`
    // can do fallbacks here (for example for buildins)
    resolve({ result, es5: result })
  } else {
    const js = file.root().plugins.js
    resolve(js.parse(file))
  }
})

const inline = (file, result, type, opts) => type === 'inline' ||
  opts.inline && opts.inline.includes(file.external) ||
  file.virtual

exports.compileDeps = inline

const parseCode = (id, file, result, type, opts) => {
  if (inline(file, result, type, opts)) {
    if (file.ua) {
      if (!result.ua) result.ua = {}
      Object.assign(result.ua, file.ua)
    }

    env(file, result, opts)

    return type === 'inline'
      ? file.es5.compute()
      : file.result.compute()
  } else {
    const code = `var ${id} = require('${file.external}')`
    if (file.external === 'vigour-ua/navigator') {
      if (!result.ua) result.ua = {}
      result.ua.file = {
        val: file.id.compute(),
        code
      }
    }
    return code
  }
}

const parseSemver = version => version.split('.').map(val => parseInt(val, 10))

const compareSemver = (a, b) => {
  a = parseSemver(a)
  b = parseSemver(b)
  console.log(a, b)
  for (let i = 0, len = a.length; i < len; i++) {
    if (a[i] > b[i]) {
      if (i === 0) {
        console.log(chalk.red('   !!! major version mismatch !!!'))
      }
      return true
    } else if (a[i] < b[i]) {
      if (i === 0) {
        console.log(chalk.red('   !!! major version mismatch !!!'))
      }
      return false
    }
  }
}

exports.compile = (file, result, type, opts, traversed, module) => {
  const id = file.id.compute()
  if (type !== 'inline' && file.polyfill) return

  if (traversed[id] && traversed[id].stamp === module.stamp) {
    // need to do an array if we want to choose the best version
    const version = chalk.blue(traversed[id].file.version)
    const colored = chalk.blue(type)
    let str = `   ${colored} double ${chalk.blue(file.external)}`

    if (compareSemver(file.version, traversed[id].file.version)) {
      const code = parseCode(id, file, result, type, opts)
      result.code[traversed[id].index] = code
      traversed[id].file = file
      str += ` 1 use ${chalk.blue(file.version)} over ${version}`
    } else if (traversed[id].file.version !== file.version) {
      str += ` 2 use ${version} over ${chalk.blue(file.version)}`
    } else {
      str += ` use ${version}`
    }

    console.log(str)
    return
  }
  const index = result.code.length
  module.index = index
  traversed[id] = { file, stamp: module.stamp, index }
  result.code.push(parseCode(id, file, result, type, opts))
}
