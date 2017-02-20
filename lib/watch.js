const chokidar = require('chokidar')
const fs = require('fs')
const builtin = require('is-builtin-module')
const exclude = require('./exclude')

const isExternal = file => file.get([ 'external', 'compute' ])

module.exports = (boy, stamp) => {
  const readTheBoy = filename => fs.readFile(filename, (err, data) => {
    if (err) return console.log(err)
    const boychild = boy.get(filename)
    // console.log('👲 ', chalk.blue(`${filename} changed`))
    if (boychild) {
      boychild.set({ code: data.toString() })
    }
  })
  var watcher
  boy.set({
    props: {
      default: {
        on: {
          data: {
            watch (val, stamp, file) {
              if (!file.virtual) {
                if (val !== null) {
                  const ext = isExternal(file)
                  var path = file.key // path will become path

                  // use exclude
                  if (ext && builtin(ext)) {
                    file.set({ code: '' })
                    return
                  }

                  if (file.key === 'undefined') {
                    throw new Error('illegal filepath (watch.js) - ' + path)
                  }

                  fs.readFile(path, (err, data) => {
                    if (err) {
                      file.set({
                        result: { val: err }
                      }, stamp)
                      return
                    }
                    file.set({ code: data.toString() })
                    if (!boy.__nowatch__) {
                      if (watcher) {
                        watcher.add(file.key)
                      } else {
                        watcher = chokidar.watch(file.key, {
                          ignoreInitial: true
                        }).on('change', readTheBoy)
                      }
                    }
                  })
                } else {
                  if (!boy.__nowatch__) watcher.unwatch(file.key)
                }
              }
            }
          }
        }
      }
    }
  }, stamp)
}
