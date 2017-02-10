const build = require('../')
const fs = require('fs')
const browserifynice = require('../lib/browser')

var cnt = 0
// build('test/simple/bla.js', (err, result) => {
//   if (err) {
//     console.log('error', err)
//     return
//   }
//   cnt++
//   console.log(result.node)
//   fs.writeFileSync(`./test/simple/dist/${cnt}.js`, result.node)
//   console.log('\n\n\ngo run script!!!!\n')
//   try {
//     require(`./simple/dist/${cnt}.js`)
//   } catch (e) {
//     console.log(e)
//   }
// })

// build('../brisky-struct/src/index.js', (err, result) => {
//   if (err) {
//     // console.log('.....ERROR', !!result, cnt, err)
//     return
//   } else {
//     cnt++
//     fs.writeFileSync(`./test/real/dist/${cnt}.js`, result.node)
//
//     console.log('---------------------------------------------')
//     try {
//       console.log(require(`./real/dist/${cnt}.js`))
//     } catch (e) {
//       console.log('lulllzors', e)
//     }
//     console.log('---------------------------------------------')
//   // })
//   }
// })

// build file as input
build('./test/real/index.js', (err, result) => {
  // console.log('hello wtf....')
  if (err) {
    // console.log('.....ERROR', !!result, cnt, err)
    return
  } else {
    cnt++
    // fs.writeFileSync(`./test/real/dist/${cnt}.js`, result.browser)
    // fs.writeFileSync(`./test/real/dist/browser.js`, result.browser)

    // data = `const require = (val) => {}; ${data}`
    // console.log(result.inlineBrowser)

    fs.writeFileSync(`./test/real/dist/blarx.js`, result.inlineBrowser)

    // console.log('---------------------------------------------')
    // try {
    //   console.log(require(`./real/dist/${cnt}.js`))
    // } catch (e) {
    //   console.log('lulllzors', e)
    // }
    // console.log('---------------------------------------------')
  // })
  }
})

// '../hub.js/src/index.js'
// build('./test/real/hub.js', (err, result) => {
//   console.log('hello wtf....')
//   if (err) {
//     console.log('.....ERROR', !!result, cnt, err)
//     return
//   } else {
//     cnt++
//     fs.writeFileSync(`./test/real/dist/${cnt}.js`, result.node)
//     console.log('---------------------------------------------')
//     try {
//       require(`./real/dist/${cnt}.js`)
//     } catch (e) {
//       console.log('lulllzors', e)
//     }
//     console.log('---------------------------------------------')
//   }
// })

// build('./test/real/index.js', (err, result) => {
//   console.log('hello wtf....')
//   if (err) {
//     console.log('.....ERROR', !!result, cnt, err)
//     return
//   } else {
//     cnt++
//     fs.writeFileSync(`./test/real/dist/${cnt}.js`, result.node)
//     console.log('---------------------------------------------')
//     try {
//       require(`./real/dist/${cnt}.js`)
//     } catch (e) {
//       console.log('lulllzors', e)
//     }
//     console.log('---------------------------------------------')
//   }
// })
