const astw = require('astw')
const hash = require('string-hash')
const builtin = require('is-builtin-module')
const noderesolve = require('resolve')
const { dirname } = require('path')
const fs = require('fs')
const acorn = require('acorn')
// const { isExternal } = require('./util')

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
  // var isExternal
  // if (!(dep[0] === '.' && (dep[1] === '/' || (dep[1] === '.' && dep[2] === '/')))) {
  //   console.log('🚚 🚚 🚚 🚚  is external 🚚 🚚 🚚 🚚 ', dep)
  //   imports.isExternal = imports.file
  // }
  // if (isExternal(dep)) {
    // console.log('external yesh!', dep)
  // }

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
          if (imports.exports['*']) {
            imports.vars[imports.exports['*']] = imports.id + '_$ALL$'
          } else if (imports.exports.default) {
            imports.vars[imports.exports.default] = imports.id
          } else {
            for (let i in imports.exports) {
              if (i !== 'default' && i !== '*') {
                const seperator = imports.isExternal ? '.' : '_export_'
                imports.vars[imports.exports[i][0]] = `${imports.id}${seperator}${imports.exports[i][1]}`
              }
            }
          }
          resolve(realfile)
        }
      })
    })
  }
})

const setStore = (node, replaceImports, insertId, store, shorthand) => {
  if (
    store[node.name] &&
    (!parent(node, objectProperty) || (node.parent.key !== node || node.parent.shorthand || node.parent.computed)) &&
    node.parent.property !== node
  ) {
    if (!hasLocalVar(node)) {
      // also need to put import if nessecary ofc...
      if (node.parent.shorthand) {
        if (
          !shorthand[shorthand.length - 1] ||
          shorthand[shorthand.length - 1].start !== node.start
        ) {
          shorthand.push({ start: node.start, name: node.name })
        }
      }

      if (store[node.name] !== true && store[node.name].type === 'imports') {
        if (
          !replaceImports[replaceImports.length - 1] ||
          replaceImports[replaceImports.length - 1].start !== node.start
        ) {
          replaceImports.push({ start: node.start, name: node.name, store: store[node.name] })
        }
      } else if (store[node.name] === true) {
        if (insertId[insertId.length - 1] !== node.start) {
          insertId.push(node.start)
        }
      }
    }
    return true
  }
}

const identifier = (node, replaceImports, insertId, store, shorthand) => {
  if (node.name && node.type === 'Identifier') {
    if (parent(node, blockVar) || parent(node, blockInlinevar)) {
      if (node.parent.id.name !== node.name) {
        setStore(node, replaceImports, insertId, store, shorthand)
      } else {
        const fn = getFn(node)
        if (fn) {
          if (!fn.localVars) { fn.localVars = {} }
          fn.localVars[node.name] = true
        }
      }
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
        const fn = getFn(node)
        if (!fn.localVars) { fn.localVars = {} }
        fn.localVars[node.name] = true
      }
    } else if (parent(node, inlinevar) || parent(node, variableDeclaration)) {
      if (store[node.name] && store[node.name] !== true && store[node.name].type === 'imports') {
        if (
          !replaceImports[replaceImports.length - 1] ||
          replaceImports[replaceImports.length - 1].start !== node.start
        ) {
          replaceImports.push({ start: node.start, name: node.name, store: store[node.name] })
        }
      } else {
        store[node.name] = true
        if (insertId[insertId.length - 1] !== node.start) {
          insertId.push(node.start)
        }
      }
    } else {
      setStore(node, replaceImports, insertId, store, shorthand)
    }
  }
}

const exportDefault = (node, replaceExports) => {
// now need to push shit when its a variable / import
  // need to run shit on the value as well
  const exports = {
    start: node.start,
    sEnd: node.declaration.start,
    type: 'default'
  }

  replaceExports.push(exports)
}

const exportNamedDeclaration = (node, replaceExports) => {
  // local and exported
  if (node.specifiers.length) {
    replaceExports.push({
      type: 'blank',
      start: node.start,
      sEnd: node.specifiers[0].start
    })

    for (let i = 0, len = node.specifiers.length; i < len; i++) {
      if (i > 0) {
        replaceExports.push({
          type: 'blank',
          insert: '\n',
          start: node.specifiers[i - 1].end,
          sEnd: node.specifiers[i].start
        })
      }
      replaceExports.push({
        type: 'assignment',
        start: node.specifiers[i].start,
        identifier: node.specifiers[i].local.name,
        sEnd: node.specifiers[i].start
      })
    }

    replaceExports.push({
      type: 'blank',
      start: node.end - 1,
      sEnd: node.end
    })
  } else if (node.declaration) {
    const declaration = node.declaration
    const exports = {
      start: node.start,
      type: 'assignment'
    }
    const type = declaration.type
    if (type === 'VariableDeclaration') {
      exports.sEnd = declaration.declarations[0].init.start
      exports.identifier = declaration.declarations[0].id.name
    } else if (type === 'FunctionDeclaration') {
      exports.identifier = declaration.id.name
      exports.sEnd = declaration.start
    }
    replaceExports.push(exports)
  }
}

function walk (node, parent, cb, blocks) {
  var keys = Object.keys(node)

  var walktargets = []

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (key === 'parent') continue
    var child = node[key]
    if (Array.isArray(child)) {
      for (var j = 0; j < child.length; j++) {
        var c = child[j]
        if (c && typeof c.type === 'string') {
          c.parent = node
          walktargets.push(c)
          // walk(c, node, cb)
        }
      }
    } else if (child && typeof child.type === 'string') {
      child.parent = node
      walktargets.push(child)
      // walk(child, node, cb)
    }
  }

  // console.log('--->', node.type)
  cb(node)

  walktargets.forEach((c) => {
    if (c.type === 'BlockStatement') {
      blocks.push({ c, node, cb, blocks })
    } else {
      walk(c, node, cb, blocks)
    }
  })
}

module.exports = code => {
  return new Promise((resolve, reject) => {
    const computed = code.compute()
    const ast = acorn.parse(computed, {
      ecmaVersion: 6,
      sourceType: 'module',
      allowReserved: true,
      allowReturnOutsideFunction: true,
      allowHashBang: true
    })
    const file = code.parent()
    const insertId = []
    const insertImports = []
    const replaceImports = []
    const replaceExports = []
    const shorthand = []
    const id = '$' + hash(file.key) // can be memoized
    const store = {}

    // will be replaced...

    const parse = node => {
      if (node.type === 'ExportNamedDeclaration') {
        exportNamedDeclaration(node, replaceExports)
      } else if (node.type === 'ExportDefaultDeclaration') {
        exportDefault(node, replaceExports)
      } else if (node.type === 'ImportDeclaration') {
        const imports = {
          type: 'imports',
          file: node.source.value,
          start: node.start,
          end: node.end
        }
        const exports = {}
        imports.exports = exports
        node.specifiers.forEach(node => {
          if (node.imported) {
            exports[node.imported.name] = [ node.local.name, node.imported.name ]
          } else if (node.type === 'ImportDefaultSpecifier') {
            exports.default = node.local.name
          } else {
            exports['*'] = node.local.name
          }
          store[node.local.name] = imports
        })
        insertImports.push(imports)
      } else {
        identifier(node, replaceImports, insertId, store, shorthand)
      }
    }

    // const walk = astw(ast)
    var blocks = []
    walk(ast, void 0, parse, blocks)

    blocks.forEach(({ c, node, cb, blocks }) => {
      walk(c, node, cb, blocks)
    })

    Promise.all(insertImports.map(val => prepImports(val, file))).then((dependencies) => {
      insertId.sort((a, b) => a - b)
      replaceImports.sort((a, b) => a.start - b.start)
      shorthand.sort((a, b) => a.start - b.start)
      replaceExports.sort((a, b) => a.start - b.start)

      var result = ''
      var j = 0
      var n = 0
      var k = 1
      var p = 0
      var l = 0
      var str

      for (let i = 0, len = computed.length; i < len; i++) {
        let imports = insertImports[n]
        let exports = replaceExports[p]
        let replaceImport = replaceImports[k]
        let sh = shorthand[l]

        if (imports && i === imports.start) {
          i += (imports.end - imports.start - 1)
          n++
        } else if (exports && i === exports.start) {
          const end = exports.sEnd
          const start = exports.start
          if (exports.type === 'default') {
            result += `const ${id} = `
            i += (end - start - 1)
          } else if (exports.type === 'assignment') {
            result += `const ${id}_export_${exports.identifier} = `
            i += (end - start - 1)
          } else if (exports.type === 'blank') {
            if (exports.insert) {
              result += exports.insert
            }
            i += (end - start - 1)
          }
          p++
        } else {
          if (sh && i === sh.start) {
            result += `${sh.name}: `
            l++
          }
          if (i === insertId[j]) {
            result += id + '_'
            j++
            result += computed[i]
          } else if (replaceImport && replaceImport.start === i) {
            result += replaceImport.store.vars[replaceImport.name]
            i += replaceImport.name.length - 1
            k++
          } else {
            result += computed[i]
          }
        }
      }

      // * imports -- this can be optional (only add it when its required like this)
      // add a * in the deps path/* -- then this will be store on code * (which will just be the little object)
      // here its allready
      for (let i = 0, len = replaceExports.length; i < len; i++) {
        if (replaceExports[i].type === 'assignment') {
          // the all one
          if (!str) str = `\nconst ${id}_$ALL$ = {`
          let name = replaceExports[i].identifier
          str += `\n  ${name}: ${id}_export_${name},`
        }
      }

      if (str) {
        str = str.slice(0, -1)
        str += '\n}'
        result += str
      }

      console.log('result:', result)

      resolve({ result, dependencies, code })
    }).catch(err => reject(err))
  })
}
