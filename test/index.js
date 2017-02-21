const build = require('../')
const test = require('tape')
const { testBuild } = require('./util')

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
