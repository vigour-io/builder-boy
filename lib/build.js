const chalk = require('chalk')
const boy = require('./boy')
var stamp = 0

const compile = () => {

}

const build = (file, opts) => new Promise((resolve, reject) => {
  // pass options as well
  const targets = opts.targets

  if (targets.includes('node')) {
    builder(file).then(val => {
      console.log('x?', Object.keys(val))
    }).catch(err => reject(err))

    // builder(file, 'browser')
  }

  if (targets.includes('browser')) {

  }
  // were going to use plugins for building + type
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
      traversed[key] = { file }
      return Promise.all(
        file.get(deps, {}).map(val => new Promise(resolve => {
          const key = val.origin().parent().key
          if (!(key in traversed)) {
            resolve(builder(val.origin().parent(), traversed))
          } else {
            resolve()
          }
        }))).then(() => traversed)
    })
}

module.exports = build
