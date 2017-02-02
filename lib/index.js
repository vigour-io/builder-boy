// const { struct } = require('brisky-struct')
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const defaultCache = {}

// basic
const readImports = /^(?!\/\/ )import (.+) from '(.+)'/

// read export default
const exportDefault = /^export default (.+)/

const fromCache = (file, cache) => new Promise((resolve, reject) => {
  if (!cache[file]) {
    cache[file] = { inProgress: new Promise(resolve => {}) }
    console.log(chalk.grey(' - add file to cache', file))
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const imports = cache[file].imports = {}
        // const external = cache[file].external = {}
        const exports = cache[file].exports = {}
        cache[file].build = ''
        var code = data.toString()
        const lines = code.split('\n')
        lines.forEach((line) => {
          // cache[file]
          const match = line.match(readImports)
          if (match) {
            if (match[2][0] === '.') {
              match[2] = path.join(file.slice(0, file.lastIndexOf('/')), match[2])
              if (!/\.js$/.test(match[2])) {
                // check if its a directory!
                match[2] += '.js'
              }
            } else {
              console.log('external import', match[2])
            }
            imports[match[1]] = match[2]
          }
          const lineExports = line.match(exportDefault)
          if (lineExports) {
            // console.log('go go go', lineExports)
            exports.default = lineExports[2]
          }
        })
        Promise.resolve(cache[file].inProgress, cache[file])
        cache[file].inProgress = null

        var arr = []
        for (var i in imports) {
          arr.push(fromCache(imports[i], cache))
        }

        if (exports.default) {

        }

        if (arr.length) {
          Promise.all(arr).then(() => {
            console.log('lullz now lets make shit')
          })
        } else {
          console.log('done!', file)
          // a ==
          resolve(cache[file])
        }
      }
    })
  } else {
    if (cache[file].inProgress) {
      console.log('first read in progress')
    }
  }
})

exports.build = (file, dest, watch = true, cache = defaultCache) => {
  // fs
  if (!dest) dest = './dist/' + file.slice(file.lastIndexOf('/') + 1)

  console.log('👲 builder-boy build', chalk.blue(file), 'to', chalk.blue(dest), '👲')
  fs.realpath(file, (err, file) => {
    if (err) console.log('👲 error! in realpath', err)
    fromCache(file, cache).then(val => {
      console.log('go go go', val)
    })
  })
  // fromCache
}
