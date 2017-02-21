const build = require('../../')
const test = require('tape')
// const fs = require('fs')
// const { join } = require('path')

test('external', t => {
  build('./test/external/a.js', { nowatch: false }, (err, results, boy) => {
    console.log('wtf.......')
    if (!err) {
      console.log('hello', results.inline.length)
    }
  })
})
