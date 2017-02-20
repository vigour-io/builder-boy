const exclude = require('../../exclude')

exports.parse = file => new Promise((resolve, reject) => {

  resolve({ result: {} })
})

exports.compile = (file, type) => {
  if (type === 'inline') {
    file.es5.compute()
  } else {
    file.result.compute()
  }
}
