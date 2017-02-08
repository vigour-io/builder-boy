const chokidar = require('chokidar')
const fs = require('fs')
const { isExternal } = require('./util')

module.exports = (boy, stamp) => {
  const readTheBoy = filename => fs.readFile(filename, (err, data) => {
    if (err) return console.log(err)
    const boychild = boy.get(filename)
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
              if (val !== null) {
                if (isExternal(file)) {
                  file.set({ code: '' })
                  return
                }

                if (file.key === 'undefined') {
                  throw new Error('illegal deps')
                }
                fs.readFile(file.key, (err, data) => {
                  if (err) {
                    file.set({
                      result: { val: err }
                    }, stamp)
                    return
                  }
                  file.set({ code: data.toString() })
                  if (watcher) {
                    watcher.add(file.key)
                  } else {
                    watcher = chokidar.watch(file.key, {
                      ignoreInitial: true
                    }).on('change', readTheBoy)
                  }
                })
              } else {
                watcher.unwatch(file.key)
              }
            }
          }
        }
      }
    }
  }, stamp)
}
