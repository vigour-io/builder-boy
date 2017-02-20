const build = require('../../')
const test = require('tape') // or ava? its node only

test('simple', t => {
  build('./test/basic/a.js', { inline: [ 'brisky-stamp' ] }, (err, results) => {
    console.log('-------------')
    if (err) console.log('err', err)
    // console.log(results.node)
    // console.log(results.browser)
    console.log(results.node)
  })

  // boy.add({
  //   require: './a.js',
  //   from: // has to be a file
  // })
})
