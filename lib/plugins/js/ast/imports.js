const setVars = imports => {
  if (imports.exports) {
    imports.vars = {}
    if (imports.exports['*']) {
      imports.vars[imports.exports['*']] = imports.id + '_$ALL$'
    } else if (imports.exports.default) {
      imports.vars[imports.exports.default] = imports.id
    } else {
      for (let i in imports.exports) {
        if (i !== 'default' && i !== '*') {
          const seperator = imports.isExternal ? '.' : '_'
          imports.vars[imports.exports[i][0]] = `${imports.id}${seperator}${imports.exports[i][1]}`
        }
      }
    }
  }
}

const prepImports = (imports, file) => new Promise((resolve, reject) => {
  console.log('😭', imports.file, '😭')
  file.root().add({
    require: imports.file,
    from: file
  }).then(({ node, browser }) => {
    imports.id = node.id.compute() // browser is the same
    imports.isExternal = node.external
    setVars(imports)
    resolve({
      node: node.key,
      browser: browser.key
    })
  })
})

module.exports = prepImports
