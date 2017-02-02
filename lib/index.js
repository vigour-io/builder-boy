// const { struct } = require('brisky-struct')
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const defaultCache = {}
const hash = require('string-hash')

// basic
const readImports = /^(?!\/\/ )import (.+) from '(.+)'/

// read export default
const exportDefault = /^export default (.+)/

const fromCache = (file, cache) => new Promise((resolve, reject) => {
  if (!cache[file]) {
    const id = hash(file)
    cache[file] = {
      inProgress: new Promise(resolve => {}),
      id: '$file' + id
    }
    console.log(chalk.grey(' - add file to cache', file))
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const imports = cache[file].imports = {}
        // const external = cache[file].external = {}
        const exports = cache[file].exports = {}
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
            // console.log('go go go', lineExports)
            exports.default = lineExports[2]
            build = build.replace(lineExports[0], `const ${id}=${exports.default}`)
            // cache[file]
          }
        })
        Promise.resolve(cache[file].inProgress, cache[file])
        cache[file].inProgress = null

        var arr = []
        for (var i in imports) {
          arr.push(fromCache(imports[i], cache))
        }

        cache[file].build = build

        if (arr.length) {
          Promise.all(arr).then(() => {
            resolve(cache[file])
          })
        } else {
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

exports.build = (file, dest, watch = true, cache = defaultCache) => new Promise((resolve, reject) => {
  // fs
  if (!dest) dest = './dist/' + file.slice(file.lastIndexOf('/') + 1)
  const d = Date.now()
  console.log('👲 builder-boy build', chalk.blue(file), 'to', chalk.blue(dest), '👲')
  fs.realpath(file, (err, file) => {
    if (err) console.log('👲 error! in realpath', err)
    fromCache(file, cache).then(val => {
      var result = ''
      const walker = val => {
        if (val.imports) {
          for (let i in val.imports) {
            walker(cache[val.imports[i]])
            result += '\n' + cache[val.imports[i]].build
          }
        }
      }
      walker(result)
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
