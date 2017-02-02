const boy = require('../lib/watcher')
const fs = require('fs')

fs.realpath(__dirname + '/simple/a.js', (err, real) => { // eslint-disable-line
  console.log('00', real)
  boy.set({
    [real]: true
  })

  setTimeout(() => {
    console.log(JSON.stringify(boy.serialize(), false, 2))
    console.log('::', build(real))
  }, 500)
})

function build (filename) {
  const file = boy.get(filename)
  var result = file.get('result').compute()
  file.get('dependencies').keys().forEach(dep => {
    result = build(dep) + '\n' + result
  })
  return result
}
