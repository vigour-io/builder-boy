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
        console.log('build!')
        moreBuild(real, (err, code) => {
          f = true
          console.log('watch it--->', err)
          cb(err, code)
        })
      }
    })
    moreBuild(real, (err, code) => {
      f = true
      console.log('build it:--->', err)
      cb(err, code)
    })
  })
  return boy
}

const moreBuild = (real, rdy) => {
  console.log(`\n👲  builder-boy build ${chalk.blue(real)}`)
  var d = Date.now()

  build(real).then(result => {
    console.log(`👲  done building in ${chalk.green(Date.now() - d)} ms`)
    rdy(null, result)
  }).catch(err => {
    console.log('godamn err', err)
    rdy(err)
  })
}

// now lets start doing external deps as well
const build = (name, traversed = {}) => new Promise((resolve, reject) => {
  var result
  const file = boy.get(name, {})
  // console.log(chalk.white('\nbuild' + ': ' + file.key))
  file.get('result', '')
    .once(val => {
      // console.log('????', name)
      result = val.compute()
      if (val.parent().error && val.parent().error.val) {
        console.log(chalk.red('!!! ERROR !!!'))
        reject(val.parent().error.val)
      } else {
        if (!result) {
          // console.log('SHIT!', chalk.red(file.key), result)
        } else {
          // console.log(chalk.magenta('    result'), file.key)
        }
        return result
      }
    })
    .then(() => Promise.all(
      file.get('dependencies', {}).map(({ key }) => new Promise(resolve => {
        if (!(key in traversed)) {
          traversed[key] = true
          resolve(build(key, traversed))
        } else {
          resolve('')
        }
      }))
    )
  )
  .then(resolved => resolve(`${resolved.join('\n')}\n${result}`))
  .catch(err => {
    console.log('ERROR', err)
    reject(err)
  })
})

module.exports = buildBoy
