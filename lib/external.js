const builtin = require('is-builtin-module')
const hash = require('string-hash')
const astwalker = require('./astwalker')

// const requireRe = /\brequire\b/

const external = code => new Promise((resolve, reject) => {
  // builtin
  const dependencies = []
  const file = code.parent()
  const id = '$' + hash(file.key)
  const modulename = file.key.replace(/^external-/, '')
  if (builtin(modulename)) {
    const result = `const ${id} = require('${modulename}')`
    resolve({ code, dependencies, result })
  } else {
    // so this is the 'shimmed result for node'
    const result = `const ${id} = require('${modulename}')`
    // resolve(astwalker(code))
    // were now going to make asts here
    resolve({ code, dependencies, result })
  }
})

module.exports = external
