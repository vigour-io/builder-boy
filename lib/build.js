var stamp = 0
const chalk = require('chalk')
const boy = require('boy')

const build = (name, root, opt) => {
  const finish = (result, inline, field = 'result') => {
    stamp++
    const deps = {}
    const ua = {}
    var env
    var code = ''
    const compile = module => {
      if (module.stamp === stamp || !module.deps) return ''

      if (module.externalName) {
        if (result[module.externalName] && result[module.externalName].stamp === stamp) {
          // needs to load version (no replacement when major)
          const id = module.file.id()
          const d = result[module.externalName].file.id()
          code = code + `\n // FILE (resolved double module): ${module.name}\n` + `var ${id} = ${d};`
          console.log(chalk.red(`   double external module ${module.externalName}`))
          console.log(`   using "${module.name}`)
          return
        }
      }

      if (module.externalName) {
        result[module.externalName] = { stamp, file: module.file }
      }
      module.stamp = stamp
      if (
        (
          !inline && (
            !opt.inline ||
            opt.inline.indexOf(module.externalName) === -1
          )
        ) &&
        module.external && !module.file.virtual
      ) {
        if (module.externalName === 'vigour-ua/navigator') {
          ua.hash = {
            val: module.file.id(),
            start: code.length
          }
          if (!module.file.external.polyfill) {
            deps[module.externalName] = true // add version here
            code = code + `\n // FILE EXTERNAL: ${module.name}\n` + module.external + ';'
          }
          ua.hash.end = code.length
        } else {
          if (!module.file.external.polyfill) {
            deps[module.externalName] = true // add version here
            code = code + `\n // FILE EXTERNAL: ${module.name}\n` + module.external + ';'
          }
        }
      } else {
        module.deps.forEach(dep => compile(result[dep]))

        if (module.file.get('uaResult')) {
          Object.assign(ua, module.file.get('uaResult'))
        }
        var str = ((module.file.get([ field, 'compute' ]) ||
          module.file.get('result').compute())) + ';'

        if (inline && module.file.env) {
          if (!env) env = {}
          Object.assign(env, module.file.env)
        }

        code = code + `\n // FILE: ${module.name}\n` + str
      }
    }
    compile(result[name])
    // ua will become conditions / vars (plugin)
    if (env) {
      code = `process.env = ${JSON.stringify(env)};` + code
    }

    return { code, deps, ua, env }
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

module.exports = build
