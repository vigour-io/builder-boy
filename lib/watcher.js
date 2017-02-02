const builtin = require('is-builtin-module')
const detect = require('detect-import-require')
const { struct } = require('brisky-struct')
const noderesolve = require('resolve')
const chokidar = require('chokidar')
const acorn = require('acorn')
const fs = require('fs')
var watcher

const readTheBoy = file => fs.readFile(file, (err, content) => {
  if (err) return console.log(err)
  const boychild = boy.get(file)
  if (boychild) boychild.set({ content })
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

const boy = struct({
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
                const child = code.parent()
                const ast = acorn.parse(code.compute(), {
                  ecmaVersion: 6,
                  sourceType: 'module',
                  allowReserved: true,
                  allowReturnOutsideFunction: true,
                  allowHashBang: true
                })

                // find real dependency paths and watch them too
                const dependencies = detect(ast)
                  .filter(dep => !builtin(dep))
                  .map(dep => new Promise(resolve => {
                    noderesolve(dep, (err, resolved) => {
                      if (err) return console.log(err)
                      fs.realpath(resolved, (err, realfile) => {
                        if (err) return console.log(err)
                        boy.set({ [realfile]: {} })
                        resolve(realfile)
                      })
                    })
                  }))

                // store dependencies
                Promise.all(dependencies)
                  .then(resolvedpaths => child.set({
                    exports: {
                      default: { // @todo not always on default
                        dependencies: resolvedpaths
                      }
                    }
                  }))

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
