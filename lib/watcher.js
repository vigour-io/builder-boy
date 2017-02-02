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

                walk(node => {
                  // do something
                  // node.type
                  // node.parent
                  if (
                    node.type === 'Identifier' &&
                    !(
                        node.parent &&
                        node.parent.type === 'Property' &&
                        node.parent.parent &&
                        node.parent.parent.type === 'ObjectExpression'
                      ) &&
                    !(
                      node.parent && node.parent.type === 'MemberExpression'
                      )
                  ) {
                    if (insertId[insertId.length - 1] !== node.start) {
                      insertId.push(node.start)
                    }
                  }
                })

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
