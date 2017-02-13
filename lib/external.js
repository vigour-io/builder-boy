const builtin = require('is-builtin-module')
const hash = require('string-hash')
const astwalker = require('./ast')

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
    let result
    console.log(modulename)
    if (modulename === 'node-fetch') {
      console.log('FETCH')
      result = `var ${id} = global.fetch = require('${modulename}')`
      resolve({ code, dependencies, result })
    } else {
      result = `var ${id} = require('${modulename}')`
      resolve(astwalker(code))
    }
    file.set({ externalUse: result }, false)
  }
})

module.exports = external
