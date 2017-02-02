const browserresolve = require('browser-resolve')
const boy = require('../lib')
const fs = require('fs')

fs.realpath(__dirname + '/simple/a.js', (err, real) => { // eslint-disable-line
  console.log('00', real)
  boy.set({
    [real]: true
  })

  setTimeout(() => {
    console.log(JSON.stringify(boy.serialize(), false, 2))
    console.log('::\n', build(real))
  }, 500)
})

function build (filename, traversed = {}) {
  const file = boy.get(filename, {})
  var result = file.get('result', '').compute()
  file.get('dependencies', {}).keys().forEach(dep => {
    if (!(dep in traversed)) {
      traversed[dep] = true
      result = `${build(dep, traversed)}\n${result}`
    }
  })
  return result
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
