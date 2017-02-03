const browserresolve = require('browser-resolve')
const boy = require('../lib')
const fs = require('fs')
const chalk = require('chalk')

fs.realpath(__dirname + '/simple/a.js', (err, real) => { // eslint-disable-line
  boy.set({ [ real ]: true })
  var f
  boy.get([ real, 'result' ], {}).on((val, stamp, t) => {
    if (f) {
      console.log('go!', stamp)
      moreBuild(real)
    }
  })
  moreBuild(real, () => {
    f = true
  })
})

  var cnt = 0
const moreBuild = (real, rdy) => {
  console.log(`👲  builder-boy build ${chalk.blue(real)}`)
  var d = Date.now()
  build(real).then(result => {
    cnt++
    if (rdy) rdy()
    // console.log('SUCCESS', result)
    console.log(`👲  done building in ${chalk.green(Date.now() - d)} ms`)
    fs.writeFileSync(`./test/simple/dist/${cnt}.js`, result)
    console.log('\n\n\ngo run script!!!!\n')
    require(`./simple/dist/${cnt}.js`)
  })
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
  ).then(resolved => `${resolved.join('\n-------------------------')}\n${result}`)
}

// function browserbuild (filename, traversed = {}) {

//   return result
// }

// function gatherpaths (filename, traversed = {}) {
//   const file = boy.get(filename, {})
//   return file.get('dependencies', {}).keys()
//     .filter(dep => !(dep in traversed))
//     .map(dep => new Promise((resolve, reject) => {
//       traversed[dep] = true
//       browserresolve(dep, (err, file) => {
//         if (err) {
//           reject(err)
//         } else {
//           resolve(file)
//         }
//       })
//     }))
// }
