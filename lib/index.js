// const browserresolve = require('browser-resolve')
const boy = require('./struct')
const fs = require('fs')
const chalk = require('chalk')

const buildBoy = (path, opt, cb) => {
  if (typeof opt === 'function') cb = opt
  // opts -- dest, and watch: false
  fs.realpath(path, (err, real) => { // eslint-disable-line
    var f
    boy.set({ [ real ]: true })
    boy.get([ real, 'result' ], {}).on((val, stamp, t) => {
      if (f) {
        f = false
        moreBuild(real, (err, code) => {
          f = true
          cb(err, code)
        })
      }
    })
    moreBuild(real, (err, code) => {
      f = true
      cb(err, code)
    })
  })
  return boy
}

const moreBuild = (real, rdy) => {
  console.log(`\n👲  builder-boy build ${chalk.blue(real)}`)
  var d = Date.now()
  const file = boy.get(real, {})

  build(real, file).then(result => {
    console.log(`👲  ${chalk.green('success')} build in ${chalk.green(Date.now() - d)} ms`)
    rdy(null, result)
  }).catch(err => {
    if (err.file) {
      console.log(`   ${chalk.red(err.message)} in file ${chalk.red(err.file)} `)
      const line = err.message.match(/\((\d+):(\d+)\)/)
      if (line) {
        const nr = 1 * line[1]
        const char = 1 * line[2]
        const file = fs.readFileSync(err.file)
        const lines = file.toString().split('\n')
        lines.forEach((val, i) => {
          if (i > nr - 4 && i < nr + 4) {
            var linenr = i + ' '
            linenr = chalk.grey((new Array(5 - linenr.length)).join(' ') + linenr)
            if (i === nr - 1) {
              console.log(`   ${linenr} ${chalk.red(val)}`)
              console.log(`        ${(new Array(char - 1)).join(' ')}${chalk.red('^')}`)
            } else {
              console.log(`   ${linenr} ${val}`)
            }
          }
        })
      }
    }
    console.log(`👲  ${chalk.red('error')} build in ${chalk.red(Date.now() - d)} ms`)
    rdy(err)
  })
}

var tmp = {}

setTimeout(() => {
  console.log(tmp)
}, 1e3)

// now lets start doing external deps as well
const build = (name, root, traversed = {}) => {
  var result
  const file = boy.get(name, {})
  return file.get('result', '')
    .once(val => {
      if (!val.compute()) {
        tmp[val.parent().key] = true
      } else {
        delete tmp[val.parent().key]
      }
      result = val.compute()
      return val.compute()
    })
    .then(() => Promise.all(
      file.get('dependencies', {}).map(({ key }) => new Promise(resolve => {
        if (!(key in traversed)) {
          traversed[key] = true
          resolve(build(key, root, traversed))
        } else {
          resolve('')
        }
      }))
    ))
    .then(resolved => {
      resolved.forEach(val => {
        if (val instanceof Error) {
          throw val
        }
      })
      if (result instanceof Error) {
        return result
      }
      return `${resolved.join('\n')}\n${result}`
    })
}

module.exports = buildBoy
