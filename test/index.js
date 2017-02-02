const boy = require('../lib/watcher')
const fs = require('fs')

fs.realpath(__dirname + '/simple/a.js', (err, real) => { // eslint-disable-line
  console.log('00', real)
  boy.set({
    [real]: true
  })
})
