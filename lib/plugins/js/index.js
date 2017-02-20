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

exports.compile = (file, type) => {
  if (type === 'inline') {
    file.es5.compute()
  } else {
    file.result.compute()
  }
}
