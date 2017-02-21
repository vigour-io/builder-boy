const boy = require('./boy')
var stamp = 0

const finish = (traversed, opts, target, type = 'node') => {
  stamp++
  const result = { code: '' }
  const compile = module => {
    if (module.stamp === stamp) return
    module.stamp = stamp
    // how to do this elegantly?
    if (module.file.compileDeps(module.file, result, type, opts, traversed, module)) {
      module.dependencies.forEach(key => compile(traversed[key]))
    }
    module.file.compile(module.file, result, type, opts, traversed, module)
  }
  compile(traversed[target.key])
  return result
}

const build = (file, opts) => new Promise((resolve, reject) => {
  const targets = opts.targets
  const results = {}
  var cnt = targets.length

  if (targets.includes('node')) {
    builder(file).then(val => {
      results.node = finish(val, opts, file)
      cnt--
      if (!cnt) resolve(results)
    }).catch(err => reject(err))
  }

  if (targets.includes('browser') || targets.includes('inline')) {
    builder(file, 'browser').then(val => {
      if (targets.includes('browser')) {
        cnt--
        results.browser = finish(val, opts, file, 'browser')
      }
      if (targets.includes('inline')) {
        cnt--
        results.inline = finish(val, opts, file, 'inline')
      }
      if (!cnt) resolve(results)
    }).catch(err => reject(err))
  }
})

const builder = (file, deps = 'dependencies', traversed = {}) => {
  const key = file.key
  var result

  return file.get('result', {})
    .once(val => {
      if (val.compute()) {
        result = val.compute()
        return result
      }
    })
    .then(() => {
      if (result instanceof Error) {
        traversed.ERROR = result
        throw result
      }
      const dependencies = file
        .get(deps, {}).map(val => val.origin().parent().key)

      traversed[key] = { file, dependencies }

      return Promise.all(dependencies.map(key => new Promise(resolve => {
        if (!(key in traversed)) {
          resolve(builder(boy.get(key), deps, traversed))
        } else {
          resolve()
        }
      }))).then(() => traversed)
    })
}

module.exports = build
