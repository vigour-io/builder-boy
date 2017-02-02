const builtin = require('is-builtin-module')
const detect = require('detect-import-require')
const { create } = require('brisky-struct')
const noderesolve = require('resolve')
const chokidar = require('chokidar')
const falafel = require('falafel')
const acorn = require('acorn')
const astw = require('astw')
const fs = require('fs')
var watcher

const regexRequire = /\brequire\b/
const regexImport = /\bimport\b/

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
                const ast = acorn.parse(code.compute(), {
                  ecmaVersion: 6,
                  sourceType: 'module',
                  allowReserved: true,
                  allowReturnOutsideFunction: true,
                  allowHashBang: true
                })

                const child = code.parent()
                const walk = astw(ast)
                const requires = []
                const imports = []

                walk(node => {
                  if (node.type === 'Identifier') {
                    if (node.name === 'require') {
                      if (node.parent.arguments) {
                        requires.push(node.parent.arguments[0].value)
                      }
                    } else {
                      // here do some love with names
                    }
                  } else if (node.type === 'ImportDeclaration') {
                    imports.push(node.source.value)
                  }
                })

                console.log('--imports---', imports)
                console.log('--requires--', requires)

                // // find real dependency paths and watch them too
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
                //   }))

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
