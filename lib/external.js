const builtin = require('is-builtin-module')
const hash = require('string-hash')
const astwalker = require('./astwalker')

const external = code => new Promise((resolve, reject) => {
  const dependencies = []
  const file = code.parent()
  const ext = file.external.compute()
  const id = '$' + hash(file.get([ 'resolvedFrom', 'compute' ]) || file.key)
  const modulename = ext

  if (builtin(modulename)) {
    const result = `var ${id} = require('${modulename}')`
    file.set({ externalUse: result }, false)
    resolve({ code, dependencies, result })
  } else {
    const result = `var ${id} = require('${modulename}')`
    file.set({ externalUse: result }, false)
    resolve(astwalker(code))
  }
})

module.exports = external
