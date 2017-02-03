// const browserresolve = require('browser-resolve')
const boy = require('./struct')
const fs = require('fs')
const chalk = require('chalk')

const buildBoy = (path, opt, cb) => {
  if (typeof opt === 'function') cb = opt
  boy.on('error', cb)
  // opts -- dest, and watch: false
  fs.realpath(path, (err, real) => { // eslint-disable-line
    boy.set({ [ real ]: true })
    var f
    boy.get([ real, 'result' ], {}).on((val, stamp, t) => {
      if (f) {
        moreBuild(real, (err, code) => { cb(err, code) })
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

function build (name, traversed = {}) {
  var result
  const file = boy.get(name, {})
  return file.get('result', '')
    .once(val => (result = val.compute()))
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
  ).then(resolved => `${resolved.join('\n')}\n${result}`)
}

module.exports = buildBoy
