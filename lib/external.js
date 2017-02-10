const builtin = require('is-builtin-module')
const hash = require('string-hash')
const astwalker = require('./astwalker')

// const requireRe = /\brequire\b/

const external = code => new Promise((resolve, reject) => {
  // builtin
  const dependencies = []
  const file = code.parent()
  const ext = file.external.compute()

  // also not good need to check resolveNode
  const id = '$' + hash(file.get([ 'resolvedFrom', 'compute' ]) || file.key)
  const modulename = ext
  if (builtin(modulename)) {
    const result = `const ${id} = require('${modulename}')`
    file.set({ externalUse: result }, false)
    resolve({ code, dependencies, result })
  } else {
    const result = `const ${id} = require('${modulename}')`
    file.set({ externalUse: result }, false)

    // need to have 2
    console.log('\n\n', file.external.serialize())

    resolve(astwalker(code))
    // were now going to make asts here
    // resolve({ code, dependencies, result })
  }
})

module.exports = external
