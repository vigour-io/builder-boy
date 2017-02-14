const build = require('../')
const fs = require('fs')
const chalk = require('chalk')

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

build('../brisky-struct/src/index.js', (err, result) => {
  if (err) {
    // console.log('.....ERROR', !!result, cnt, err)
    return
  } else {
    cnt++
    fs.writeFileSync(`./test/real/dist/${cnt}.js`, result.node)

    console.log('---------------------------------------------')
    try {
      console.log(require(`./real/dist/${cnt}.js`))
    } catch (e) {
      console.log('lulllzors', e)
    }
    console.log('---------------------------------------------')
  // })
  }
})

// build file as input
// build('./test/real/render.js', (err, result) => {
//   // console.log('hello wtf....')
//   if (err) {
//     // console.log('.....ERROR', !!result, cnt, err)
//     return
//   } else {
//     cnt++
//     // fs.writeFileSync(`./test/real/dist/${cnt}.js`, result.browser)
//     // fs.writeFileSync(`./test/real/dist/browser.js`, result.browser)
//     // data = `const require = (val) => {}; ${data}`
//     // console.log(result.inlineBrowser)
//       // fs.writeFileSync(`./test/real/dist/blarx.js`, result.node)
//     fs.writeFileSync(`./test/real/dist/blarx.js`, result.inlineBrowser)
//     // console.log('---------------------------------------------')
//     // try {
//     //   console.log(require(`./real/dist/${cnt}.js`))
//     // } catch (e) {
//     //   console.log('lulllzors', e)
//     // }
//     // console.log('---------------------------------------------')
//   // })
//   }
// })

const list = require('vigour-ua/test/common/useragents/list')
const ua = require('vigour-ua')
const uas = []
for (var i in list) {
  list[i].forEach(val => {
    uas.push(ua(val))
  })
}

uas.push({
  browser: 'dirtyyuzi',
  platform: 'android',
  version: 10,
  prefix: 'blurf',
  device: 'phone'
})


const parse = require('vigour-ua')

const http = require('http')

const parseElement = require('parse-element')
// build file as input

var bla

http.createServer((req, res) => {

  const x = parse(req.headers['user-agent'])
  if (!bla) {
    res.end('building....')
  } else {
    res.end(parseElement(bla(x)))
  }

}).listen(3030)

// { raw: true }
// build('./test/real/render.js', { inline: [ '@vigour-io/play', 'brisky-render' ] }, (err, result) => {
//   // console.log('hello wtf....')
//   if (err) {
//     console.log('.....ERROR', !!result, cnt, err)
//     return
//   } else {
//     if (result.ua.node) {
//       console.log('gets them builds')
//       for (var i in result.ua.node.builds) {
//         // console.log(i)
//         fs.writeFileSync(`./test/real/dist/${i}.js`, result.ua.node.builds[i])
//       }

//       const logUa = (id, input) => {
//         // console.log('RESULT>', id)
//         if (!id) {
//           console.log(chalk.red('BAD --> ua:'), input.browser, input.version, input.platform, input.device, input.webview)
//         } else {
//           for (var i in result.ua.node.val) {
//             const r = result.ua.node.val[i]
//             if (r.id === id) {
//               console.log(chalk.green('GOOD --> ua:'), input.browser, input.version, input.platform, input.device, input.webview,
//                 chalk.white('match:'), r.ua.browser, r.ua.version, r.ua.platform, r.ua.device, r.ua.webview)
//               // console.log('GOOD --> ua:', r.ua.browser, r.ua.version, r.ua.platform)
//               break
//             }
//           }
//         }
//       }

//       fs.writeFileSync(`./test/real/dist/select.js`, result.ua.node.select)
//       const select = require(`./real/dist/select.js`)

//       const nasty = {}
//       for (var i in result.ua.node.builds) {
//         nasty[i] = require(`./real/dist/${i}.js`)
//       }

//       bla = function (ua) {
//         return nasty[select(ua)]
//       }

//       // uas.forEach(val => {
//       //   logUa(select(val), val)
//       // })

//       // console.log(result.ua.node.val.filter(val => val.ua.webview))

//     }

//     // cnt++
//     // fs.writeFileSync(`./test/real/dist/blarx.js`, result.inlineBrowser)
//   }
// })

// build('./test/simple/ua.js', (err, result) => {
//   if (err) {
//     // console.log('.....ERROR', !!result, cnt, err)
//     return
//   } else {
//     cnt++
//     fs.writeFileSync(`./test/simple/dist/gurk.js`, result.node)
//   }
// })

// build('../phoenix/src/index.js', {
//   inline: [ '@vigour-io/play', 'brisky-render' ]
// }, (err, result) => {
//   if (err) {
//     // console.log('.....ERROR', !!result, cnt, err)
//     return
//   } else {
//     cnt++
//     fs.writeFileSync(`./test/real/dist/blarx.js`, result.inlineBrowser)
//   }
// })

// '../hub.js/src/index.js'
// build('./test/real/index.js', (err, result) => {
//   console.log('hello wtf....')
//   if (err) {
//     console.log('.....ERROR', !!result, cnt, err)
//     return
//   } else {
//     console.log(result.node)
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
