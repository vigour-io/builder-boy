const builtin = require('is-builtin-module')
const detect = require('detect-import-require')
const { struct } = require('brisky-struct')
const noderesolve = require('resolve')
const chokidar = require('chokidar')
const acorn = require('acorn')
const fs = require('fs')

const writeToBoy = file => fs.readFile(file, (err, content) => {
  const boychild = boy.get(file)
  if (boychild) boychild.set({ code })
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
    }).on('change', writeToBoy)
  }
})

const boy = struct({
  props: {
    default: {
      on: {
        data: {
          watch (val, stamp, { key: filepath }) {
            if (val !== null) {
              // start watching this file
              watchTheBoy(filename)
            } else {
              // remove the watcher
              watcher.unwatch(filepath)
            }
          }
        }
      },
      props: {
        ast: true,
        dependencies: true,
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
                      fs.realpath(resolved, (err, realfile) => {
                        // add the file to the boy
                        boy.set({ [realfile]: {} })
                        resolve(realfile)
                      })
                    })
                  }))

                // store dependencies
                Promise.all(dependencies)
                  .then(dependencies => child.set({ dependencies }))

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