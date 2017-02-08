const builtin = require('is-builtin-module')
const hash = require('string-hash')

// const requireRe = /\brequire\b/

const external = (code, modulename) => new Promise((resolve, reject) => {
  // builtin
  const dependencies = []
  const file = code.parent()
  const id = '$' + hash(file.key)

  if (builtin(file.key)) {
    console.log('builtin', file.key)
    const result = `const ${id} = require('${modulename}')`
    resolve({ code, dependencies, result })
  } else {
    // if isExternal && node || browser dont use result?
    const result = `const ${id} = require('${modulename}')`
    // hello bla

    console.log(code.parent().ex)

    // ast

    // if (requireRe.test(modulename)) {

    // }

    resolve({ code, dependencies, result })
    // lets load the file in here -- and ast it
    // what about just using the ast walker and removing all require shit?
  }
})

module.exports = external
