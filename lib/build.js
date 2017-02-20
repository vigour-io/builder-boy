const chalk = require('chalk')
const boy = require('./boy')
var stamp = 0

const compile = () => {

}

const build = (file, opts) => new Promise((resolve, reject) => {
  // pass options as well
  const targets = opts.targets
  // were going to use plugins for building + type
})

const Build = (depsKey) => {
  const builder = (name, root, traversed = {}) => {
    var result, deps
    const file = boy.get(name, {})
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
        traversed[name] = { file }
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
