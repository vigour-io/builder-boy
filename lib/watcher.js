const builtin = require('is-builtin-module')
const detect = require('detect-import-require')
const { create } = require('brisky-struct')
const noderesolve = require('resolve')
const chokidar = require('chokidar')
const fs = require('fs')
const astwalker = require('./astwalker')
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
                const result = astwalker(code)
                // imports
                // require
                // build
              }
            }
          }
        }
      }
    }
  }
})

module.exports = boy
