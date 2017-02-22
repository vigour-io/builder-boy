const build = require('../')
const test = require('tape')
const { testBuild, generate } = require('./util') //eslint-disable-line

// test('simple', t => {
//   build('./test/basic/a.js', { nowatch: true }, (err, results, boy) => {
//     if (!err) {
//       testBuild('basic', results, t)
//       t.end()
//     }
//   })
// })

// test('polyfill', t => {
//   build('./test/polyfill/a.js', { nowatch: true }, (err, results, boy) => {
//     if (!err) {
//       testBuild('polyfill', results, t)
//       t.end()
//     }
//   })
// })

// test('env - inherit', t => {
//   process.env.beurs = 'ha!'
//   build('./test/env/index.js', {
//     nowatch: true,
//     targets: [ 'inline' ]
//   }, (err, results, boy) => {
//     if (!err) {
//       t.same(results, {
//         inline: '(function (global, process) { \nprocess.env = {"beurs":"ha!"};\nconsole.log(process.env.beurs)\n;\n })(window, {})'
//       }, 'env')
//       t.end()
//     }
//   })
// })

// test('env - override', t => {
//   build('./test/env/index.js', {
//     nowatch: true,
//     targets: [ 'inline' ],
//     env: { beurs: true }
//   }, (err, results, boy) => {
//     if (!err) {
//       t.same(results, {
//         inline: '(function (global, process) { \nprocess.env = {"beurs":true};\nconsole.log(process.env.beurs)\n;\n })(window, {})'
//       }, 'env')
//       t.end()
//     }
//   })
// })

// test('ua', t => {
//   build('./test/ua/index.js', {
//     nowatch: true,
//     targets: [ 'node' ],
//     inline: [ 'brisky-stamp' ]
//   }, (err, results, boy) => {
//     if (!err) {
//       testBuild('ua', results.ua.builds, t)
//       t.end()
//     }
//   })
// })

// test('virtual', t => {
//   build({
//     'virtual': {
//       virtual: true,
//       code: 'export default \'hahaha\''
//     }
//   }, { nowatch: true }, (err, results, boy) => {
//     if (!err) {
//       build('./test/virtual/index.js', { nowatch: true }, (err, results, boy) => {
//         if (!err) {
//           testBuild('virtual', results, t)
//           t.end()
//         }
//       })
//     }
//   })
// })

// test('package - error', t => {
//   build('./test/pkg/index.js', {
//     nowatch: true,
//     targets: [ 'node' ]
//   }, (err, results, boy) => {
//     if (err) {
//       t.ok(err.file.indexOf('package.json') !== -1, 'err gets file path')
//       t.end()
//     }
//   })
// })

// test('json', t => {
//   build('./test/json/index.js', {
//     nowatch: true,
//     targets: [ 'node' ]
//   }, (err, results, boy) => {
//     if (!err) {
//       testBuild('json', results, t)
//       t.end()
//     }
//   })
// })

// test('error', t => {
//   build('./test/error/index.js', {
//     nowatch: true,
//     targets: [ 'node' ]
//   }, (err, results, boy) => {
//     if (err) {
//       t.equal(err.message, 'Cannot find module "hello" (1:0)')
//       t.end()
//     }
//   })
// })

test('nested', t => {
  build('./test/nested/index.js', {
    nowatch: true,
    targets: [ 'inline' ]
  }, (err, results, boy) => {
    // if (err) {
      // t.equal(err.message, 'Cannot find module "hello" (1:0)')
      // t.end()
    // }
  })
})
