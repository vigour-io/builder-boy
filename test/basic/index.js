const build = require('../')
const fs = require('fs')

var cnt = 0
build('test/simple/a.js', (err, result) => {
  if (err) {
    console.log('error', err)
    return
  }
  cnt++
  fs.writeFileSync(`./test/simple/dist/${cnt}.js`, result.node)
  console.log('\n\n\ngo run script!!!!\n')
  try {
    require(`./simple/dist/${cnt}.js`)
  } catch (e) {
    console.log(e)
  }
})
