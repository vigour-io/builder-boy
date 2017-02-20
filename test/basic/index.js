const build = require('../../')
const test = require('tape') // or ava? its node only

test('simple', t => {
  console.log('?')
  build('./test/basic/a.js', (err, results) => {
    console.log('-----', err)
  })
})
