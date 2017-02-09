const builtin = require('is-builtin-module')
const hash = require('string-hash')

// const requireRe = /\brequire\b/

const external = code => new Promise((resolve, reject) => {
  // builtin
  const dependencies = []
  const file = code.parent()
  const id = '$' + hash(file.key)
  const modulename = file.key.replace(/^external-/, '')

  if (builtin(file.key)) {
    const result = `const ${id} = require('${modulename}')`
    resolve({ code, dependencies, result })
  } else {
    const result = `const ${id} = require('${modulename}')`
    resolve({ code, dependencies, result })
  }
})

module.exports = external
