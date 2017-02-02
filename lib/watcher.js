const builtin = require('is-builtin-module')
const detect = require('detect-import-require')
const { create } = require('brisky-struct')
const noderesolve = require('resolve')
const chokidar = require('chokidar')
const falafel = require('falafel')
const hash = require('string-hash')
const fs = require('fs')
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

const boy = create({
  props: {
    default: {
      on: {
        data: {
          watch (val, stamp, { key: file }) {
            // watch is different
            if (val !== null) {
              readTheBoy(file)
              watchTheBoy(file)
            } else {
              watcher.unwatch(file)
            }
          }
        }
      },
      props: {
        ast: true
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
                var ast
                const child = code.parent()
                const vars = {}

                // hash

                // add externa;

                const ast = falafel(code.compute(), {
                const modified = falafel(code.compute(), {
                  ecmaVersion: 6,
                  sourceType: 'module',
                  allowReserved: true,
                  allowReturnOutsideFunction: true,
                  allowHashBang: true
                }, node => {
                  if (!ast) ast = node
                  // do something
                  // node.type
                  // node.parent
                  if (node.type === 'Identifier') {
                    console.log('hello', node.name)
                  }
                })

                // browser-resolve
                // allways build 2
                  // node.update
                  if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
                    console.log('fn', node.name)
                  } else if (node.type === 'Identifier') {
                    console.log('Identifier', node.name)
                    node.update('updatedIdentifierName')
                  } else if (node.type === 'VariableDeclaration' || node.type === 'ImportDeclaration') {
                    // console.log(node.type)
                    console.log(node)
                  } else {
                    // console.log(node.type)
                  }
                })

                console.log('done', modified.toString())

                // find real dependency paths and watch them too

                // console.log(ast.chunks)

                // const dependencies = detect(ast)
                //   .filter(dep => !builtin(dep))
                //   .map(dep => new Promise(resolve => {
                //     noderesolve(dep, (err, resolved) => {
                //       if (err) return console.log(err)
                //       fs.realpath(resolved, (err, realfile) => {
                //         if (err) return console.log(err)
                //         boy.set({ [realfile]: {} })
                //         resolve(realfile)
                //       })
                //     })
                //   }))

                // store dependencies
                // Promise.all(dependencies)
                //   .then(resolvedpaths => child.set({
                //     exports: {
                //       default: { // @todo not always on default
                //         dependencies: resolvedpaths
                //       }
                //     }
                //   })).then(val => console.log('derp derp', child.exports.default.dependencies))

                // store ast
                child.set({ ast }, stamp)
              }
            }
          }
        }
      }
    }
  }
})

module.exports = boy
