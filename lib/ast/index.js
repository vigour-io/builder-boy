const prepImports = require('./imports')
const hash = require('string-hash')
const acorn = require('acorn')
const buble = require('buble')
const regenerator = require('regenerator')
const noderesolve = require('../resolve')
const { parseUa, handleUa } = require('./ua')
const { logAst, showcode, logTypeChain } = require('../util') // eslint-disable-line
const walk = require('./walk')
const { parent, parentType } = require('./parent')
const identifier = require('./identifier')
const hasLocalVar = require('./localvar')

const {
  fnOnTop,
  reqPattern,
  exportsPath,
  exportAssign,
  reqPatternCalledByFn
} = require('./patterns')

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
  if (node.specifiers.length) {
    const declarations = []
    replaceExports.push({
      type: 'blank',
      start: node.start,
      sEnd: node.end,
      declarations
    })
    for (let i = 0, len = node.specifiers.length; i < len; i++) {
      declarations.push(node.specifiers[i].local.name)
    }
  } else if (node.declaration) {
    const declaration = node.declaration
    const exports = {
      start: node.start,
      sEnd: declaration.start,
      type: 'blank',
      declarations: [
        declaration.type === 'FunctionDeclaration'
          ? declaration.id.name
          : declaration.declarations[0].id.name
      ]
    }
    replaceExports.push(exports)
  }
}

const isModuleExportsTop = node => (
  node.parent && node.parent.parent && node.parent.parent.type === 'Program' &&
  node.type === 'AssignmentExpression' &&
  node.left.type === 'MemberExpression' &&
  node.left.object.name === 'module' &&
  node.left.property.name === 'exports'
)

// const findVar = (node) => {
//   // add scopes (similair to local vars)
// }

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
    const hasExports = []
    const ua = []
    const uaResult = {}
    var hasMExports = false

    const id = '$' + hash(file.resolvedFrom ? file.resolvedFrom.compute() : file.key) // can be memoized
    const store = {}

    const parse = node => {
      if (node.type === 'ExportNamedDeclaration') {
        exportNamedDeclaration(node, replaceExports)
      } else if (node.type === 'ExportDefaultDeclaration') {
        exportDefault(node, replaceExports)
      } else if (isModuleExportsTop(node)) {
        hasMExports = true
        const exports = {
          start: node.start,
          sEnd: node.right.start,
          type: 'default'
        }
        replaceExports.push(exports)
      } else if (node.name === 'exports' && parent(node, exportsPath)) {
        hasExports.push({
          start: node.start,
          end: node.end
        })
      } else if (node.name === 'exports' && !hasLocalVar(node)) {
        if (parent(node, fnOnTop)) {
          hasExports.push({
            start: node.start,
            end: node.end
          })
        } else if (parent(node, exportAssign)) {
          hasExports.push({
            start: node.start,
            end: node.end
          })
        }
      }

      if (
        node.name === 'require' &&
        node.parent.type === 'CallExpression' &&
        node.parent.arguments[0].type === 'Literal' &&
        !hasLocalVar(node) &&
        !parentType(node, 'TryStatement')
      ) {
        const p = node.parent.parent.parent

        if (p.type === 'VariableDeclaration') {
          const imports = {
            type: 'require',
            file: node.parent.arguments[0].value,
            start: node.parent.start,
            end: node.parent.end
          }
          // objectPattern means "const { a } = require('x')"
          if (node.parent.parent.id.type === 'ObjectPattern') {
            imports.objectPattern = []
            imports.replace = imports.start
            imports.start = node.parent.parent.start

            for (let i in node.parent.parent.id.properties) {
              let val = node.parent.parent.id.properties[i].value.name
              let key = node.parent.parent.id.properties[i].key.name
              if (val !== key) {
                imports.objectPattern.push({
                  start: node.parent.parent.id.properties[i].start,
                  val: node.parent.parent.id.properties[i].value,
                  key: node.parent.parent.id.properties[i].key
                })
              } else {
                imports.objectPattern.push({
                  start: node.parent.parent.id.properties[i].start,
                  val
                })
              }
            }
          } else {
            imports.exports = { default: node.parent.parent.id.name }
          }

          handleUa(ua, imports)
          insertImports.push(imports)
        } else {
          const imports = {
            type: 'imports',
            file: node.parent.arguments[0].value,
            start: node.parent.start,
            end: node.parent.end,
            exports: {}
          }
          handleUa(ua, imports)
          insertImports.push(imports)
        }
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
        handleUa(ua, imports)
        insertImports.push(imports)
      } else {
        identifier(node, replaceImports, insertId, store, shorthand)
        parseUa(node, ua, uaResult, computed)
      }
    }

    var blocks = []
    walk(ast, void 0, parse, blocks)

    blocks.forEach(({ c, node, cb, blocks }) => {
      walk(c, node, cb)
    })

    Promise.all(insertImports.map(val => prepImports(val, file, computed))).then(dependencies => {
      insertId.sort((a, b) => a - b)
      replaceImports.sort((a, b) => a.start - b.start)
      shorthand.sort((a, b) => a.start - b.start)
      replaceExports.sort((a, b) => a.start - b.start)
      insertImports.sort((a, b) => a.start - b.start)
      hasExports.sort((a, b) => a.start - b.start)

      var result = ''
      var j = 0
      var n = 0
      var k = 0
      var p = 0
      var l = 0
      var x = 0
      var any = false
      var hasDefault = false

      if (hasExports.length) {
        if (hasMExports) {
          result = `var ${id}_exports = {}\n`
        } else {
          result = `var ${id} = {}\n`
        }
      }

      for (let i = 0, len = computed.length; i < len; i++) {
        let imports = insertImports[n]
        let exports = replaceExports[p]
        let replaceImport = replaceImports[k]
        let sh = shorthand[l]

        if (imports && i === imports.start) {
          if (imports.type === 'require') {
            let y = 0
            let handlingkey
            let obj
            for (var m = i; m < imports.replace; m++) {
              obj = imports.objectPattern[y]
              if (obj && obj.key && obj.start === m || handlingkey) {
                handlingkey = true
                if (m === insertId[j]) {
                  j++
                }
                if (m === obj.val.start) {
                  result += id + '_'
                  handlingkey = false
                }
                result += computed[m]
              } else {
                if (obj && obj.start === m) {
                  result += obj.val + ': '
                  y++
                }
                if (m === insertId[j]) {
                  result += id + '_'
                  j++
                }
                result += computed[m]
              }
            }
            result += imports.id
            i += (imports.end - imports.start - 1)
          } else {
            result += imports.id
            i += (imports.end - imports.start - 1)
          }
          n++
        } else if (exports && i === exports.start) {
          const end = exports.sEnd
          const start = exports.start
          if (exports.type === 'default') {
            hasDefault = true
            result += `const ${id} = `
            i += (end - start - 1)
            if (hasExports[x]) {
              if (hasExports[x].start > start && hasExports[x].end <= end) {
                x++
              }
            }
          } else if (exports.type === 'assignment') {
            result += `const ${id}_${exports.identifier} = `
            i += (end - start - 1)
          } else if (exports.type === 'blank') {
            if (exports.insert) {
              result += exports.insert
            }
            i += (end - start - 1)
          }
          p++
        } else {
          // showcode(hasExports, false, computed)
          if (hasExports[x] && hasExports[x].start === i) {
            result += !hasMExports ? id : id + '_exports'
            i += (hasExports[x].end - hasExports[x].start)
            x++
          } else if (sh && i === sh.start) {
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
      for (let i = 0, len = replaceExports.length; i < len; i++) {
        if (replaceExports[i].declarations) {
          replaceExports[i].declarations.forEach(name => {
            var result = name
            if (store[name]) {
              result = store[name] === true
                ? `${id}_${name}`
                : store[name].vars[name]
            }
            if (!any) any = `\nconst ${id}_$ALL$ = {`
            any += `\n  ${name}: ${result},`
          })
        }
      }

      if (any) {
        any = any.slice(0, -1)
        any += '\n}'
        result += any
      }

      // very slow obviously but we can replace buble later
      // or just inline buble (copy the code) so we can use the same ast...
      let es5
      if (result.indexOf('function *') !== -1) {
        es5 = regenerator.compile(result).code
        es5 = buble.transform(es5).code
        noderesolve('regenerator-runtime/runtime', (err, runtime) => {
          if (err) {
            reject(err)
          } else {
            dependencies.push({ node: runtime, browser: runtime })
            resolve({
              es5,
              result,
              dependencies,
              code,
              any,
              hasDefault,
              uaResult
            })
          }
        })
      } else {
        es5 = buble.transform(result).code
        resolve({
          es5,
          result,
          dependencies,
          code,
          any,
          hasDefault,
          uaResult
        })
      }
    }).catch(err => {
      reject(err)
    })
  })
}
