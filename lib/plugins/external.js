exports.condition = file => file.get([ 'external', 'compute' ]) // will be different
// here were using exclude
exports.parse = file => new Promise((resolve, reject) => {
  // use exclude in .js
  resolve({ result: {} })
})

exports.compile = (file, type) => {
  // also add stuff like include etc here
  if (type === 'inline') {
    file.es5.compute()
  } else {
    file.result.compute()
  }
}
