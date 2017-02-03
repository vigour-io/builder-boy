const build = require('../')
const fs = require('fs')

var cnt = 0
build('test/simple/a.js', (err, result) => {
  cnt++
  fs.writeFileSync(`./test/simple/dist/${cnt}.js`, result)
  console.log('\n\n\ngo run script!!!!\n')

  // console.log(result)

  require(`./simple/dist/${cnt}.js`)
})
