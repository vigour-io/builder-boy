// const browserresolve = require('browser-resolve')
const boy = require('./struct')
const fs = require('fs')
const chalk = require('chalk')

const buildBoy = (path, opt, cb) => {
  var f
  if (typeof opt === 'function') cb = opt
  // boy.on('error', (err) => {
  //   cb(err)
  // })
  // opts -- dest, and watch: false
  fs.realpath(path, (err, real) => { // eslint-disable-line
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

  build(real).then(result => {
    console.log(`👲  done building in ${chalk.green(Date.now() - d)} ms`)
    rdy(null, result)
  }).catch(err => rdy(err))
}

const build = (name, traversed = {}) => new Promise((resolve, reject) => {
  var result
  const file = boy.get(name, {})
  file.get('result', '')
    .once(val => {
      result = val.compute()
      if (val.parent().error && val.parent().error.val) {
        reject(val.parent().error.val)
      } else {
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
  .catch(err => reject(err))
})

module.exports = buildBoy
