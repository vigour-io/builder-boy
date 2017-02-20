exports.parse = file => new Promise((resolve, reject) => {
  console.log('go and do this file! MOFOS')
  resolve({ result: '' })
})

exports.compile = (file, type) => {
  if (type === 'inline') {
    file.es5.compute()
  } else {
    file.result.compute()
  }
}
