const build = require('../')
const test = require('tape')
const { testBuild, generate } = require('./util')

test('simple', t => {
  build('./test/basic/a.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('basic', results, t)
      t.end()
    }
  })
})

test('polyfill', t => {
  build('./test/polyfill/a.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('polyfill', results, t)
      t.end()
    }
  })
})

test('env - inherit', t => {
  process.env.beurs = 'ha!'
  build('./test/env/index.js', {
    nowatch: true,
    targets: [ 'inline' ]
  }, (err, results, boy) => {
    if (!err) {
      t.same(results, {
        inline: '(function (global, process) { \nprocess.env = {"beurs":"ha!"};\nconsole.log(process.env.beurs)\n;\n })(window, {})'
      }, 'env')
      t.end()
    }
  })
})

test('env - override', t => {
  build('./test/env/index.js', {
    nowatch: true,
    targets: [ 'inline' ],
    env: { beurs: true }
  }, (err, results, boy) => {
    if (!err) {
      t.same(results, {
        inline: '(function (global, process) { \nprocess.env = {"beurs":true};\nconsole.log(process.env.beurs)\n;\n })(window, {})'
      }, 'env')
      t.end()
    }
  })
})

test('ua', t => {
  build('./test/ua/index.js', {
    nowatch: true,
    targets: [ 'node' ]
    // inline: [ 'brisky-stamp' ]
  }, (err, results, boy) => {
    if (!err) {
      testBuild('ua', results.ua.builds, t)
      t.end()
    }
  })
})
