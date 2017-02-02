// const { struct } = require('brisky-struct')
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const defaultCache = {}
const hash = require('string-hash')

// basic
const readImports = /^(?!\/\/ )import (.+) from '(.+)'/

// read export default (basic)
const exportDefault = /^export default (.+)/

const fromCache = (file, cache) => new Promise((resolve, reject) => {
  if (!cache[file]) {
    const id = hash(file)
    cache[file] = {
      inProgress: Promise.resolve(true),
      id: '$file' + id
    }
    console.log(chalk.grey(' - add file to cache', file))
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const imports = cache[file].imports = {}
        // const external = cache[file].external = {}
        const e = cache[file].exports = {}
        var code = cache[file].code = data.toString()
        var build = code

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
            build = build.replace(match[0], `const ${match[1]} = $file${hash(match[2])}`)
          }
          const lineExports = line.match(exportDefault)
          if (lineExports) {
            e.default = lineExports[1]
            build = build.replace(lineExports[0], `const $file${id} = ${e.default}`)
          }
        })

        var arr = []
        for (var i in imports) {
          arr.push(fromCache(imports[i], cache))
        }

        cache[file].build = build

        if (arr.length) {
          Promise.all(arr).then(() => {
            cache[file].inProgress = null
            Promise.resolve(cache[file].inProgress)
            resolve(cache[file])
          })
        } else {
          cache[file].inProgress = null
          Promise.resolve(cache[file].inProgress)
          resolve(cache[file])
        }
      }
    })
  } else {
    if (cache[file].inProgress) {
      cache[file].inProgress.then(val =>
        resolve(cache[file])
      )
    }
  }
})

exports.build = (file, dest, watch = true, cache = defaultCache) => new Promise((resolve, reject) => {
  // fs
  if (!dest) dest = './dist/' + file.slice(file.lastIndexOf('/') + 1)
  const d = Date.now()
  console.log('👲 builder-boy build', chalk.blue(file), 'to', chalk.blue(dest), '👲')
  fs.realpath(file, (err, file) => {
    if (err) console.log('👲 error! in realpath', err)
    fromCache(file, cache).then(val => {
      var result = ''
      var done = []
      const walker = val => {
        if (val.imports) {
          for (let i in val.imports) {
            if (!done[val.imports[i]]) {
              walker(cache[val.imports[i]])
              done[val.imports[i]] = true
              result += '\n' + cache[val.imports[i]].build
            }
          }
        }
      }
      walker(val)
      result += '\n' + val.build
      if (!fs.existsSync(dest.slice(0, dest.lastIndexOf('/')))) {
        fs.mkdirSync(dest.slice(0, dest.lastIndexOf('/')))
      }
      fs.writeFileSync(dest, result)
      console.log(' - done building', chalk.white(dest), 'in', Date.now() - d, 'ms')
      resolve(dest)
    })
  })
  // fromCache
})
