const astw = require('astw')
const hash = require('string-hash')
const builtin = require('is-builtin-module')
const noderesolve = require('resolve')
const { dirname } = require('path')
const fs = require('fs')

const blockVar = [
  'VariableDeclarator',
  'VariableDeclaration',
  'BlockStatement'
]

const blockInlinevar = [
  'Property',
  'ObjectPattern',
  'VariableDeclarator',
  'VariableDeclaration',
  'Program'
]

const blockVarFunction = [
  'FunctionDeclaration'
]

const blockVarFunctionInline = [
  'Property',
  'ObjectPattern',
  'FunctionDeclaration'
]

const inlinevar = [
  'Property',
  'ObjectPattern',
  'VariableDeclarator',
  'VariableDeclaration',
  'Program'
]

const variableDeclaration = [
  'VariableDeclarator',
  'VariableDeclaration',
  'Program'
]

const objectProperty = [
  'Property',
  'ObjectExpression'
]

const hasLocalVar = node => {
  const name = node.name
  while (node) {
    if (node.localVars && node.localVars[name]) {
      return true
    }
    node = node.parent
  }
}

const getType = (node, type) => {
  while (node) {
    if (node.type === type) {
      return node
    }
    node = node.parent
  }
}

const parent = (node, arr) => {
  let len = arr.length - 1
  let i = arr.length
  node = node.parent
  while (node && i--) {
    if (node.type !== arr[len - i]) {
      return false
    }
    node = node.parent
  }
  return true
}

const add = (imports, file) => new Promise((resolve, reject) => {
  const dep = imports.file
  if (!builtin(dep)) {
    noderesolve(dep, { basedir: dirname(file.key) }, (err, resolved) => {
      if (err) {
        reject(err)
        return
      }
      fs.realpath(resolved, (err, realfile) => {
        if (err) { reject(err) } else {
          imports.file = realfile
          resolve(realfile)
        }
      })
    })
  }
})

module.exports = code => {
  const computed = code.compute()
  const acorn = require('acorn')

  const ast = acorn.parse(computed, {
    ecmaVersion: 6,
    sourceType: 'module',
    allowReserved: true,
    allowReturnOutsideFunction: true,
    allowHashBang: true
  })

  const file = code.parent()
  var insertId = []
  var insertImports = []
  const id = '$' + hash(file.key) // can be memoized
  const walk = astw(ast)
  var store = {}
  // add
  walk(node => {
    if (node.type === 'ImportDeclaration') {
      // console.log(node, node.source.value)
      const imports = { file: node.source.value }
      const exports = {}
      imports.exports = exports
      // results.dependencies.push(node.source.value)

      node.specifiers.forEach(node => {
        console.log('hello --->', node.local.name)
        if (node.imported) {
          // store/dependencies
          exports[node.imported.name] = { [node.local.name]: node.imported.name }
        } else if (node.type === 'ImportDefaultSpecifier') {
          exports.default = node.local.name
        } else {
          exports['*'] = node.local.name
        }
        console.log('add to store!', node.local.name)
        store[node.local.name] = 1
      })
      insertImports.push(imports)
    } else if (node.name && node.type === 'Identifier') {
      // var p = node
      // var arr = []
      // while (p) {
      //   arr.push(p.type)
      //   p = p.parent
      // }
      // console.log(node.name, arr)
      if (parent(node, blockVar) || parent(node, blockInlinevar)) {
        const fn = getType(node, 'FunctionDeclaration')
        if (!fn.localVars) { fn.localVars = {} }
        fn.localVars[node.name] = true
      } else if (parent(node, blockVarFunction) || parent(node, blockVarFunctionInline)) {
        if (node.parent.id === node && node.parent.parent.type === 'Program') {
          store[node.name] = true
          if (insertId[insertId.length - 1] !== node.start) {
            insertId.push(node.start)
          }
        } else {
          const fn = getType(node, 'FunctionDeclaration')
          if (!fn.localVars) { fn.localVars = {} }
          fn.localVars[node.name] = true
        }
      } else if (parent(node, inlinevar) || parent(node, variableDeclaration)) {
        store[node.name] = true
        if (insertId[insertId.length - 1] !== node.start) {
          insertId.push(node.start)
        }
      } else if (
        store[node.name] &&
        !parent(node, objectProperty) &&
        node.parent.property !== node
      ) {
        if (!hasLocalVar(node)) {
          if (store.name === 1) {
            console.log('push to imports from storage')
          } else {
            if (insertId[insertId.length - 1] !== node.start) {
              insertId.push(node.start)
            }
          }
        }
      }
    }
  })

  return Promise.all(insertImports.map(val => add(val, file))).then((deps) => {
    // import as is different ofcourse

    console.log(insertImports)

    var result = ''
    var j = 0
    for (let i = 0; i < computed.length; i++) {
      if (i === insertId[j]) {
        result += id
        j++
      }
      result += computed[i]
    }
    console.log('--------------------------------')
    console.log(computed)
    console.log('--------------------------------')
    console.log(result)
    console.log('--------------------------------')
    console.log(deps)
    return { result, deps }
  })
}
