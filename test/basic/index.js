const build = require('../../')
const test = require('tape') // or ava? its node only
const boy = require('../../lib/boy')

test('simple', t => {
  console.log('?')
  setTimeout(() => {
    console.log('-------------')
    // console.log(boy.map(val => '---> ' + (val.result ? val.result.compute() : '----')))
  }, 500)
  build('./test/basic/a.js', (err, results) => {
    console.log('-----', err)
  })

  // boy.add({
  //   require: './a.js',
  //   from: // has to be a file
  // })
})
