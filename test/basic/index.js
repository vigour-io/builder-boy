const build = require('../../')
const test = require('tape') // or ava? its node only
// const boy = require('../../lib/boy')

test('simple', t => {
  build('./test/basic/a.js', (err, results) => {
    console.log('-------------')
    if (err) console.log('err', err)
    // console.log(results.node)
    // console.log(results.browser)
    console.log(results.inline)
  })

  // boy.add({
  //   require: './a.js',
  //   from: // has to be a file
  // })
})
