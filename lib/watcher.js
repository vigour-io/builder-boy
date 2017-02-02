const builtin = require('is-builtin-module')
const detect = require('detect-import-require')
const { create } = require('brisky-struct')
const noderesolve = require('resolve')
const chokidar = require('chokidar')
const acorn = require('acorn')
const astw = require('astw')
const fs = require('fs')
const hash = require('string-hash')
var watcher

const readTheBoy = file => fs.readFile(file, (err, data) => {
  if (err) return console.log(err)
  const boychild = boy.get(file)
  if (boychild) boychild.set({ code: data.toString() })
})

const watchTheBoy = file => fs.stat(file, (err, status) => {
  if (err) return console.log('does not exist!', file)
  if (status.isDirectory()) {
    console.log('its a dir crazy boy!', file, '..doing nothing')
    // fs.readdir(file, (err, files) => {
    //   if (err) return console.log('error', err)
    //   else files.forEach(file => boy.set({ [file]: val }))
    // })
  } else if (watcher) {
    // add to watcher
    watcher.add(file)
  } else {
    // create the watcher
    watcher = chokidar.watch(file, {
      ignoreInitial: true
    }).on('change', readTheBoy)
  }
})

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

const boy = create({
  props: {
    default: {
      on: {
        data: {
          watch (val, stamp, { key: file }) {
            if (val !== null) {
              readTheBoy(file)
              watchTheBoy(file)
            } else {
              watcher.unwatch(file)
            }
          }
        }
      },
      exports: {
        default: {
          props: {
            dependencies: true
          }
        }
      },
      code: {
        val: '',
        on: {
          data: {
            parsecode (val, stamp, code) {
              if (val !== null) {
                var computed = code.compute()
                var insertId = []

                const ast = acorn.parse(computed, {
                  ecmaVersion: 6,
                  sourceType: 'module',
                  allowReserved: true,
                  allowReturnOutsideFunction: true,
                  allowHashBang: true
                })

                const child = code.parent()
                const id = '$' + hash(child.key) // can be memoized
                const walk = astw(ast)

                var store = {}

                walk(node => {
                  if (node.name && node.type === 'Identifier') {
                    // var p = node
                    // var arr = []
                    // while (p) {
                    //   arr.push(p.type)
                    //   p = p.parent
                    // }
                    // console.log(node.name, arr)

                    var blockVar = [
                      'VariableDeclarator',
                      'VariableDeclaration',
                      'BlockStatement'
                    ]

                    var blockInlinevar = [
                      'Property',
                      'ObjectPattern',
                      'VariableDeclarator',
                      'VariableDeclaration',
                      'Program'
                    ]

                    var blockVarFunction = [
                      'FunctionDeclaration'
                    ]

                    var blockVarFunctionInline = [
                      'Property',
                      'ObjectPattern',
                      'FunctionDeclaration'
                    ]

                    var inlinevar = [
                      'Property',
                      'ObjectPattern',
                      'VariableDeclarator',
                      'VariableDeclaration',
                      'Program'
                    ]

                    var variableDeclaration = [
                      'VariableDeclarator',
                      'VariableDeclaration',
                      'Program'
                    ]

                    var objectProperty = [
                      'Property',
                      'ObjectExpression'
                    ]

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
                        if (insertId[insertId.length - 1] !== node.start) {
                          insertId.push(node.start)
                        }
                      }
                    }
                  }
                })

                console.log('REPLACE', insertId)
                var build = ''
                var j = 0
                for (let i = 0; i < computed.length; i++) {
                  if (i === insertId[j]) {
                    build += id
                    j++
                  }
                  build += computed[i]
                }

                console.log('\n---------------------------')
                console.log(computed)
                console.log('\n---------------------------')
                console.log(build)
              }
            }
          }
        }
      }
    }
  }
})

module.exports = boy
