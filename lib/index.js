const boy = require('./boy')
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
    if (line) {
      logError(line, err)
    } else {
      console.log('   ' + err.stack.split('\n').slice(1)
        .filter(val => val.indexOf('brisky-struct') === -1).join('\n '))
    }
  } else {
    console.log(err)
  }
  console.log(`👲  ${chalk.red('error')} ${chalk.blue(filepath)}`)
  console.log(chalk.grey(fill('-', process.stdout.columns)), '\n')
}

const api = (path, opt, cb) => {
  if (typeof opt === 'function') {
    cb = opt
    opt = {}
  }
  opt = options(boy, opt)
  if (!cb) cb = () => {}

  const start = (err, real, val) => {
    if (err) {
      err.file = path
      errorHandler(err, path)
      cb(err)
    } else {
      let first
      let start

      if (val) {
        let arr = []
        for (let key in val) {
          arr.push(boy.add({ real: key, val: val[key] }))
        }
        start = Promise.all(arr).then(result => result[0])
      } else {
        start = boy.add({ real })
      }

      // fix this -- also fires too often
      start.then(({ node, browser }) => {
        const update = (val, stamp, t) => {
          if (first) {
            first = false
            builder({ node, browser }, (err, code) => {
              first = true
              cb(err, code || {}, boy)
            }, opt)
          }
        }
        // fires too many listeners -- nessecary when target has multiple entries
        // if (browser !== node) browser.get('result', {}).on(update)

        node.get('result', {}).on(update)
        builder({ node, browser }, (err, code) => {
          if (err) {
            setTimeout(() => { first = true }, 500)
          } else {
            first = true
          }
          cb(err, code || {}, boy)
        }, opt)
      }).catch(err => {
        errorHandler(err, real || val)
        cb(err)
      })
    }
  }

  if (typeof path === 'object') {
    start(false, Object.keys(path)[0], path)
  } else {
    fs.realpath(path, start)
  }
  return boy
}

const builder = ({ node, browser }, cb, opt) => {
  var d = Date.now()
  console.log(chalk.grey(fill('-', process.stdout.columns)))
  console.log(`👲  builder-boy build ${chalk.blue(node.key)}`)
  const target = node

  build(node, opt).then(({ browser, inline, node }) => {
    if (!target.id) {
      const err = new Error('target removed')
      err.file = target.key
      throw err
    }
    const results = {}
    const id = target.id.compute()
    const anyExports = target.get('any', '').compute()
    const defaultExports = target.get('hasDefault', '').compute()

    if (browser) {
      if (anyExports) browser.code += `\n\nmodule.exports = ${id}_$ALL$`
      if (defaultExports) browser.code += `\n\nmodule.exports = ${id}`
      results.browser = browser.code
    }

    if (node) {
      if (anyExports) node.code += `\n\nmodule.exports = ${id}_$ALL$`
      if (defaultExports) node.code += `\n\nmodule.exports = ${id}`
      if (node.ua && Object.keys(node.ua).length > 0) {
        if (!results.ua) results.ua = {}
        results.ua.node = ua(node)
        if (results.ua.node) {
          console.log('  ', chalk.blue(`generated ${
            chalk.green(results.ua.node.val.length)
          } node code branches based on user agent`))
        }
      }
      results.node = node.code
    }

    if (inline) {
      if (inline.env) {
        console.log(
          `   ${chalk.green('inline process.env')}`, '\n    ',
          Object.keys(inline.env).map(val => `${val}: ${inline.env[val]}`).join('\n     ')
        )
        inline.code = `process.env = ${JSON.stringify(inline.env)};` + inline.code
      }
      inline.code = `(function (global, process) { \n${inline.code};\n })(window, {})`
      results.inline = inline.code
    }

    console.log(`👲  ${
      chalk.green('build')
    } ${
      chalk.blue(target.key)
    } in ${
      chalk.green(Date.now() - d)
    } ms`)
    console.log(chalk.grey(fill('-', process.stdout.columns)), '\n')
    cb(null, results)
  }).catch(err => {
    errorHandler(err, target.key)
    cb(err)
  })
}

module.exports = api
