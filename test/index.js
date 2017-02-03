const browserresolve = require('browser-resolve')
const boy = require('../lib')
const fs = require('fs')

fs.realpath(__dirname + '/simple/a.js', (err, real) => { // eslint-disable-line
  boy.set({ [ real ]: true })
  build(real).then(result => {
    // console.log('SUCCESS', result)
  })
})

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
