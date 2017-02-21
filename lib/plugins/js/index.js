const ast = require('./ast')
const dependencies = require('./dependencies')

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

  if (type === 'inline') {
    result.code += '\n' + file.es5.compute()
  } else {
    result.code += '\n' + file.result.compute()
  }

  if (file.env) {
    let env = {}
    if (opts.env) {
      for (let key in file.env) {
        env[key] = opts.env[key]
      }
    } else {
      env = file.env
    }
    if (!result.env) result.env = {}
    Object.assign(result.env, env)
  }

  // if (file.ua) {
  //   console.log('UA')
  // }
}
