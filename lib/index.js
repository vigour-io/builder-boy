// const browserresolve = require('browser-resolve')
var stamp = 0
const boy = require('./struct')
const fs = require('fs')
const chalk = require('chalk')
const hash = require('string-hash')
const { isExternal, fill, logError } = require('./util')
const combineua = require('./ua')

const buildBoy = (path, opt, cb) => {
  if (opt) {
    if (opt.raw) {
      console.log(`👲  ${chalk.white('raw mode: no transpilation or polyfills')}`)
      boy.__raw__ = true
    }
    if (opt.nowatch) {
      boy.__nowatch__ = true
    }
  } else {
    boy.__raw__ = false
  }
  // disable es5 as opt
  if (typeof opt === 'function') cb = opt
    // opts -- dest, and watch: false
  fs.realpath(path, (err, real) => { // eslint-disable-line
    if (err) {
      cb(err)
    } else {
      var f
      boy.set({ [real]: true })
      boy.get([real, 'result'], {}).on((val, stamp, t) => {
        if (f) {
          f = false
          moreBuild(real, (err, code) => {
            f = true
            cb(err, code)
          }, opt)
        }
      })
      moreBuild(real, (err, code) => {
        if (err) {
          setTimeout(() => { f = true }, 500)
        } else {
          f = true
        }
        cb(err, code)
      }, opt)
    }
  })
  return boy
}

const moreBuild = (real, rdy, opt = {}) => {
  console.log(chalk.grey(fill('-', process.stdout.columns)))
  console.log(`👲  builder-boy build ${chalk.blue(real)}`)
  var d = Date.now()
  const file = boy.get(real, {})

  build(real, file, opt).then(([ node, { browserNode = { code: '' }, inlineBrowser = { code: '' } } ]) => {
    const id = '$' + hash(file.key) // can be memoized
    if (file.get('any', '').compute()) {
      node.code += `\n\nmodule.exports = ${id}_$ALL$`
      browserNode.code += `\n\nmodule.exports = ${id}_$ALL$`
    } else if (file.get('hasDefault', '').compute()) {
      node.code += `\n\nmodule.exports = ${id}`
      browserNode.code += `\n\nmodule.exports = ${id}`
    }

    if (node.ua && Object.keys(node.ua).length > 0) {
      node.ua = combineua(node)
      if (node.ua) {
        console.log('  ', chalk.blue(`found ${chalk.green(node.ua.val.length)} user agent code branches`))
      }
    }
    console.log(`👲  ${chalk.green('build')} ${chalk.blue(real)} in ${chalk.green(Date.now() - d)} ms`)
    console.log(chalk.grey(fill('-', process.stdout.columns)), '\n')

    // need to remove exports etc ofc but not for now
    inlineBrowser.code = `(function (global) { \n${inlineBrowser.code};\n })(window)`

    rdy(null, {
      node: node.code,
      browser: browserNode.code,
      inlineBrowser: inlineBrowser.code,
      dependencies: {
        node: node.deps,
        browser: browserNode.deps,
        inlineBrowser: inlineBrowser.deps
      },
      ua: node.ua ? { node: node.ua } : false
    })
  }).catch(err => {
    if (err.file) {
      console.log(`\n   ${chalk.red(err.message)}`)
      console.log(`   ${chalk.blue(err.file)}`)
      const line = err.message.match(/\((\d+):(\d+)\)/)
      if (line) logError(line, err)
      console.log(err)
    } else {
      console.log(err)
    }
    console.log(`👲  ${chalk.red('error')} in ${chalk.red(Date.now() - d)} ms`)
    console.log(chalk.grey(fill('-', process.stdout.columns)), '\n')
    rdy(err)
  })
}

const build = (name, root, opt) => {
  const finish = (result, includeExternal, field = 'result') => {
    stamp++
    const deps = {}
    const ua = {}
    var code = ''
    const compile = module => {
      if (module.stamp === stamp || !module.deps) return ''

      if (module.externalName) {
        if (result[module.externalName] && result[module.externalName].stamp === stamp) {
          // needs to load version (no replacement when major)
          const id = '$' + hash(module.file.key)
          const d = '$' + hash(result[module.externalName].file.key)
          code = code + `\n // FILE (resolved double module): ${module.name}\n` + `var ${id} = ${d};`
          console.log(chalk.red(`   double external module ${module.externalName}`))
          console.log(`   using "${module.name}`)
          return
        }
      }

      result[module.externalName] = { stamp, file: module.file }
      module.stamp = stamp
      if (
        (
          !includeExternal && (
            !opt.inline ||
            opt.inline.indexOf(module.externalName) === -1
          )
        ) &&
        module.external
      ) {
        if (module.externalName === 'vigour-ua/navigator') {
          ua.hash = {
            val: '$' + hash(module.name),
            start: code.length
          }
          if (!module.file.external.polyfill) {
            deps[module.externalName] = true // add version here
            code = code + `\n // FILE: ${module.name}\n` + module.external + ';'
          }
          ua.hash.end = code.length
        } else {
          if (!module.file.external.polyfill) {
            deps[module.externalName] = true // add version here
            code = code + `\n // FILE: ${module.name}\n` + module.external + ';'
          }
        }
      } else {
        module.deps.forEach(dep => compile(result[dep]))

        if (module.file.get('uaResult')) {
          Object.assign(ua, module.file.get('uaResult'))
        }

        code = code + `\n // FILE: ${module.name}\n` +
          ((module.file.get([ field, 'compute' ]) ||
          module.file.get('result').compute())) + ';'
      }
    }
    compile(result[name])
    // ua will become conditions / vars (plugin)
    return { code, deps, ua }
  }
  return Promise.all([
    buildNormal(name, root).then(finish),
    buildBrowser(name, root).then(result => {
      const browserNode = finish(result)
      // just add es6 as well as an inline build (for different browsers etc)
      const inlineBrowser = finish(result, true, 'es5') // this will become optional
      return { browserNode, inlineBrowser }
    })
  ])
}

const Build = (depsKey, includeExternal) => {
  const builder = (name, root, traversed = {}) => {
    var result, deps
    const file = boy.get(name, {})

    if (!includeExternal && isExternal(file)) {
      return file.get('result', '').once(val => val.compute()).then(() => {
        traversed[name] = { external: file.externalUse.compute(), name, deps: [], result: file.externalUse.compute() }
      })
    }

    return file.get('result', '')
      .once(val => {
        result = val.compute()
        return result
      })
      .then(() => {
        if (result instanceof Error) {
          traversed.ERROR = result
          throw result
        }

        deps = file.get(depsKey, {}).map(({ key }) => key)

        traversed[name] = {
          file,
          deps,
          name
        }

        const externalName = isExternal(file)
        if (externalName) {
          if (file.externalUse) {
            traversed[name].externalName = externalName
            traversed[name].external = file.externalUse.compute()
          }
        }

        return Promise.all(
          deps.map(key => new Promise(resolve => {
            if (!(key in traversed)) {
              resolve(builder(key, root, traversed))
            } else {
              resolve()
            }
          }))).then(() => traversed)
      })
  }

  return builder
}

const buildNormal = Build('dependencies', true)
const buildBrowser = Build('browser', true)

module.exports = buildBoy
