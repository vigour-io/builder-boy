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
  if (type === 'inline') {
    result.code += '\n' + file.es5.compute()
  } else {
    result.code += '\n' + file.result.compute()
  }

  if (file.env) {
    console.log('ENV')
  }

  if (file.ua) {
    console.log('UA')
  }
}
