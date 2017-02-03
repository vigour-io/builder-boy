const build = require('../')
const fs = require('fs')

var cnt = 0
// build('test/simple/a.js', (err, result) => {
//   cnt++
//   fs.writeFileSync(`./test/simple/dist/${cnt}.js`, result)
//   console.log(result)

//   console.log('\n\n\ngo run script!!!!\n')

//   require(`./simple/dist/${cnt}.js`)
// })

build('test/real/index.js', (err, result) => {
  cnt++
  fs.writeFileSync(`./test/real/dist/${cnt}.js`, result)
  if (err) {
    console.log(err)
  }
  console.log('??? result:', result)

  // console.log('\n\n\ngo run script!!!!\n')
  console.log('REQUIRE:')
  console.log('---------------------------------------------')
  require(`./real/dist/${cnt}.js`)
  console.log('---------------------------------------------')
})
