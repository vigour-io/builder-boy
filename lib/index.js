// const { struct } = require('brisky-struct')
const fs = require('fs')
const chalk = require('chalk')

const defaultCache = {}

const fromCache = (file, cache) => new Promise((resolve, reject) => {
  if (!cache[file]) {
    cache[file] = {
      inProgress: new Promise()
    }
    console.log(chalk.grey(' - add file to cache', file))
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err)
      } else {
        var code = data.toString()
        resolve(code)
        Promise.resolve(cache[file].inProgress, code)
        cache[file].inProgress = null
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
