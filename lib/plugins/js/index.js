const ast = require('./ast')
const dependencies = require('./dependencies')
const env = require('../env')

exports.parse = file => new Promise((resolve, reject) => {
  ast(file.code).then(val => {
    dependencies(val.dependencies, file)
    // can be done from imports straight
    delete val.dependencies // this has to become better ofcourse...
    resolve(val)
  }).catch(err => reject(err))
})

exports.compile = (file, result, type, opts) => {
  // way more shit of course, --> env, uaResult
  // also add finish
  if (!file.result) return

  result.code.push(
    type === 'inline'
      ? file.es5.compute()
      : file.result.compute()
  )

  env(file, result, opts)

  if (file.ua) {
    if (!result.ua) result.ua = {}
    Object.assign(result.ua, file.ua)
  }
}
