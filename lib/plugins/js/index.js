const env = require('../env')

exports.parse = require('./ast')

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
