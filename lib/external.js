const builtin = require('is-builtin-module')
const astwalker = require('./ast')

// exclude will go to boy so you can add them as an option
// make this into an object for perf
const exclude = require('./exclude').reduce((a, b) => {
  a[b] = true
  return a
}, {})

const external = code => new Promise((resolve, reject) => {
  const dependencies = []
  const file = code.parent()
  const ext = file.external.compute()
  const id = file.id()
  const modulename = ext

  if (builtin(modulename)) {
    const result = `var ${id} = require('${modulename}')`
    file.set({ externalUse: result }, false)
    resolve({ code, dependencies, result })
  } else {
    const result = `var ${id} = require('${modulename}')`
    file.set({ externalUse: result }, false)
    if (exclude[modulename]) {
      resolve({ code, dependencies, result: code.compute() })
    } else {
      resolve(astwalker(code))
    }
  }
})

module.exports = external
