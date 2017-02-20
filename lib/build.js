const chalk = require('chalk')
const boy = require('./boy')
var stamp = 0

const finish = (traversed, opts, target, type = 'node') => {
  stamp++
  var result = { code: '' }
  const compile = module => {
    if (module.stamp === stamp) return ''
    module.dependencies.forEach(key => compile(traversed[key]))
    module.file.compile(module.file, result, type, opts)
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
      const node = finish(val, opts, file)
      results.node = node
      // if (!(--cnt)) {
      // console.log(results)
      resolve(results)
      // }
    }).catch(err => reject(err))
  }

  if (targets.includes('browser')) {
    // const inline = targets.includes('inline')
  }
})

const builder = (file, deps = 'dependencies', traversed = {}) => {
  const key = file.key
  var result
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
      const dependencies = file.get(deps, {})
        .map(val => val.origin().parent().key)

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
