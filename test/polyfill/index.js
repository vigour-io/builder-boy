const build = require('../../')
const test = require('tape')
const { testBuild } = require('../util')

test('polyfill', t => {
  build('./test/polyfill/a.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('polyfill', results, t)
      t.end()
    }
  })
})
