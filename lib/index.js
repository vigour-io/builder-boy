const { struct } = require('brisky-struct')
const fs = require('fs')
const chalk = require('chalk')

const defaultCache = {}

const fromCache = (file, cache) => {
  if (!cache[file]) {
    console.log(chalk.grey(' - add file to cache', file))
  }
  //  return object
}

exports.build = (file, dest, watch = true, cache = defaultCache) => {
  // fs
  if (!dest) dest = './dist/' + file.slice(file.lastIndexOf('/') + 1)

  console.log('👲 builder-boy build', chalk.blue(file), 'to', chalk.blue(dest), '👲')
  fs.realpath(file, (err, file) => {
    if (err) console.log('👲 error! in realpath', err)
    fromCache(file, cache)
  })
  // fromCache
}
