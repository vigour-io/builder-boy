const build = require('../')
const fs = require('fs')

var cnt = 0
// build('test/simple/a.js', (err, result) => {
//   if (err) {
//     console.log('error', err)
//     return
//   }
//   cnt++
//   fs.writeFileSync(`./test/simple/dist/${cnt}.js`, result)
//   console.log('\n\n\ngo run script!!!!\n')
//   try {
//     require(`./simple/dist/${cnt}.js`)
//   } catch (e) {
//     console.log(e)
//   }
// })

build('../brisky-struct/src/index.js', (err, result) => {
  if (err) {
    console.log('.....ERROR', !!result, cnt, err)
    return
  } else {
    // console.log('??? result:', result)
    cnt++
    // console.log(result.node)

    fs.writeFileSync(`./test/real/dist/${cnt}.js`, result.node)
    // console.log('\n\n\ngo run script!!!!\n')
    console.log('REQUIRE:')
    console.log('---------------------------------------------')
    try {
      require(`./real/dist/${cnt}.js`)
    } catch (e) {
      console.log('lulllzors', e)
    }
    console.log('---------------------------------------------')
  }
})

// build('brisky-struct', (err, result) => {
//   cnt++
//   fs.writeFileSync(`./test/real/dist/${cnt}.js`, result)
//   if (err) {
//     console.log(err)
//   }
//   console.log('??? result:', result)

//   // console.log('\n\n\ngo run script!!!!\n')
//   console.log('REQUIRE:')
//   console.log('---------------------------------------------')
//   require(`./real/dist/${cnt}.js`)
//   console.log('---------------------------------------------')
// })
