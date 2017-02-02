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

const functionExpression = [
  'FunctionExpression'
]

const arrowFunction = [
  'ArrowFunctionExpression'
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

const getFn = (node) => {
  // 'blockVarFunction'
  // arrowFunction
  // FunctionDeclaration
  // ArrowFunctionExpression

  while (node) {
    if (
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression'
    ) {
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

const prepImports = (imports, file) => new Promise((resolve, reject) => {
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
          imports.id = '$' + hash(realfile)
          imports.vars = {}
          if (imports.exports.default) {
            imports.vars[imports.exports.default] = imports.id
          }
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
  var replaceImports = []
  var replaceExports = []
  const id = '$' + hash(file.key) // can be memoized
  const walk = astw(ast)
  var store = {}

  walk(node => {
    var p = node
    var arr = []
    while (p) {
      arr.push(p.type)
      p = p.parent
    }
    // console.log(arr)

    if (node.type === 'ExportDefaultDeclaration') {
      // now need to push shit when its a variable / import
      if (node.declaration.type === 'Literal') {
        replaceExports.push({
          start: node.start,
          end: node.end,
          val: node.declaration.raw
        })
      }
    } else if (node.type === 'ImportDeclaration') {
      const imports = {
        file: node.source.value,
        start: node.start,
        end: node.end
      }
      const exports = {}
      imports.exports = exports
      node.specifiers.forEach(node => {
        if (node.imported) {
          exports[node.imported.name] = { [node.local.name]: node.imported.name }
        } else if (node.type === 'ImportDefaultSpecifier') {
          exports.default = node.local.name
        } else {
          exports['*'] = node.local.name
        }
        store[node.local.name] = imports
      })
      insertImports.push(imports)
    } else if (node.name && node.type === 'Identifier') {
      if (parent(node, blockVar) || parent(node, blockInlinevar)) {
        const fn = getFn(node)
        if (!fn.localVars) { fn.localVars = {} }
        fn.localVars[node.name] = true
      } else if (
        parent(node, blockVarFunction) ||
        parent(node, blockVarFunctionInline) ||
        parent(node, arrowFunction) ||
        parent(node, functionExpression)
      ) {
        if (node.parent.id === node && node.parent.parent.type === 'Program') {
          store[node.name] = true
          if (insertId[insertId.length - 1] !== node.start) {
            insertId.push(node.start)
          }
        } else {
          console.log('--->', node.name)
          const fn = getFn(node)
          if (!fn.localVars) { fn.localVars = {} }
          fn.localVars[node.name] = true
        }
      } else if (parent(node, inlinevar) || parent(node, variableDeclaration)) {
        if (store[node.name] && store[node.name] !== true) {
          if (!replaceImports[replaceImports.length - 3] !== node.start) {
            replaceImports.push(node.start, node.name, store[node.name])
          }
        } else {
          store[node.name] = true
          if (insertId[insertId.length - 1] !== node.start) {
            insertId.push(node.start)
          }
        }
      } else if (
        store[node.name] &&
        !parent(node, objectProperty) &&
        node.parent.property !== node
      ) {
        if (!hasLocalVar(node)) {
          console.log(store[node.name])
          if (store[node.name] !== true) {
            console.log('???', replaceImports[replaceImports.length - 3])
            if (!replaceImports[replaceImports.length - 3] !== node.start) {
              replaceImports.push(node.start, node.name, store[node.name])
              console.log(replaceImports)
            }
          } else {
            if (insertId[insertId.length - 1] !== node.start) {
              insertId.push(node.start)
            }
          }
        }
      }
    }
  })

  return Promise.all(insertImports.map(val => prepImports(val, file))).then((dependencies) => {
    // import as is different ofcourse
    var result = ''
    var j = 0
    var n = 0
    var k = 0
    var p = 0
    for (let i = 0; i < computed.length; i++) {
      let imports = insertImports[n]
      let exports = replaceExports[p]
      if (imports && i === imports.start) {
        i += (imports.end - imports.start)
        n++
      } else if (exports && i === exports.start) {
        // if exports default of course....
        result += `const ${id} = ${exports.val}`
        i += (exports.end - exports.start)
        p++
      } else {
        if (i === insertId[j]) {
          result += id + '_'
          j++
        } else if (i === replaceImports[k]) {
          result += replaceImports[k + 2].vars[replaceImports[k + 1]]
          i += replaceImports[k + 1].length
          k += 3
        }
        result += computed[i]
      }
    }
    console.log('--------------------------------')
    console.log(computed)
    console.log('--------------------------------')
    console.log(result)
    console.log('--------------------------------')
    return { result, dependencies }
  })
}
