// const { struct } = require('brisky-struct')
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const defaultCache = {}

const readImports = /^(?!\/\/ )import (.+) from '(.+)'/

const fromCache = (file, cache) => new Promise((resolve, reject) => {
  if (!cache[file]) {
    cache[file] = { inProgress: new Promise(resolve => {}) }
    console.log(chalk.grey(' - add file to cache', file))
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err)
      } else {
        var code = data.toString()
        const lines = code.split('\n')
        lines.forEach((line) => {
          // cache[file]
          const match = line.match(readImports)
          if (match) {
            if (match[2][0] === '.') {
              match[2] = path.join(file.slice(0, file.lastIndexOf('/')), match[2])
            } else {
              console.log('external!', match[2])
            }
            console.log('var:', match[1], 'import:', match[2])
          }
        })
        Promise.resolve(cache[file].inProgress, code)
        cache[file].inProgress = null
        resolve(code)
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
