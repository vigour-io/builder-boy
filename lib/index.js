const boy = require('./struct')
const fs = require('fs')
const chalk = require('chalk')
const { fill, logError } = require('./log')
const ua = require('./ua')
const options = require('./options')
const build = require('./build')

const errorHandler = (err, filepath) => {
  if (err.file) {
    console.log(`\n   ${chalk.red(err.message)}`)
    console.log(`   ${chalk.blue(err.file)}`)
    const line = err.message.match(/\((\d+):(\d+)\)/)
    if (line) logError(line, err)
  } else {
    console.log(err)
  }
  console.log(`👲  ${chalk.red('error')} ${chalk.blue(filepath)}`)
  console.log(chalk.grey(fill('-', process.stdout.columns)), '\n')
}

const buildBoy = (path, opt, cb) => {
  if (typeof opt === 'function') {
    cb = opt
    opt = {}
  }
  opt = options(boy, opt)

  const start = (err, real, val) => {
    if (err) {
      errorHandler(err)
      cb(err)
    } else {
      var f
      boy.get([real, 'result'], {}).on((val, stamp, t) => {
        if (f) {
          f = false
          builder(real, (err, code) => {
            f = true
            cb(err, code, boy)
          }, opt)
        }
      })
      boy.set(val || { [real]: true })
      builder(real, (err, code) => {
        if (err) {
          setTimeout(() => { f = true }, 500)
        } else {
          f = true
        }
        cb(err, code, boy)
      }, opt)
    }
  }

  if (typeof path === 'object') {
    start(false, Object.keys(path)[0], path)
  } else {
    fs.realpath(path, start)
  }
  return boy
}

const builder = (start, cb, opt) => {
  console.log(chalk.grey(fill('-', process.stdout.columns)))
  console.log(`👲  builder-boy build ${chalk.blue(start)}`)
  var d = Date.now()
  const file = boy.get(start, {})
  build(start, file, opt).then(({ browser, inline, node }) => {
    const id = file.id()
    const results = { dependencies: {} }

    const anyExports = file.get('any', '').compute()
    const defaultExports = file.get('hasDefault', '').compute()

    if (browser) {
      if (anyExports) browser.code += `\n\nmodule.exports = ${id}_$ALL$`
      if (defaultExports) browser.code += `\n\nmodule.exports = ${id}`
      results.dependencies.browser = browser.deps
      results.browser = browser.code
    }

    if (node) {
      if (anyExports) node.code += `\n\nmodule.exports = ${id}_$ALL$`
      if (defaultExports) node.code += `\n\nmodule.exports = ${id}`
      if (node.ua && Object.keys(node.ua).length > 0) {
        node.ua = ua(node)
        if (node.ua) {
          console.log('  ', chalk.blue(`generated ${
            chalk.green(node.ua.val.length)
          } code branches based on user agent`))
        }
      }
      results.dependencies.node = node.deps
      results.node = node.code
    }

    if (inline) {
      if (inline.env) {
        console.log(
          `   ${chalk.green('inline process.env')}`, '\n    ',
          Object.keys(inline.env).map(val => `${val}: ${inline.env[val]}`).join('\n     ')
        )
      }
      inline.code = `(function (global, process) { \n${inline.code};\n })(window, {})`
      results.dependencies.inline = inline.deps
      results.inline = inline.code
    }

    console.log(`👲  ${
      chalk.green('build')
    } ${
      chalk.blue(start)
    } in ${
      chalk.green(Date.now() - d)
    } ms`)
    console.log(chalk.grey(fill('-', process.stdout.columns)), '\n')

    cb(null, results)
  }).catch(err => {
    errorHandler(err, start)
    cb(err)
  })
}

module.exports = buildBoy
