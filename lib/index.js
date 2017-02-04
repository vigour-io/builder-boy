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

  build(real).then(result => {
    console.log(`👲  done building in ${chalk.green(Date.now() - d)} ms`)
    rdy(null, result)
  }).catch(err => {
    console.log(err)
    // can only do this when everythign is done
    // rdy(err)
  })
}

var tmp = {}

setTimeout(() => {
  console.log(tmp)
}, 1e3)

// now lets start doing external deps as well
const build = (name, traversed = {}) => new Promise((resolve, reject) => {
  var result
  const file = boy.get(name, {})

  file.get('result', '')
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
          resolve(build(key, traversed))
        } else {
          resolve('')
        }
      }))
    ))
    .then(resolved => {
      return resolve(`${resolved.join('\n')}\n${result}`)
    })
    .catch(err => {
      console.log('error')
      reject(err)
    })
})

module.exports = buildBoy
