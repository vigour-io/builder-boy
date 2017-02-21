const build = require('../../')
const test = require('tape')
const fs = require('fs')
const { join } = require('path')

test('simple', t => {
  build('./test/basic/a.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      t.equal(results.node, fs.readFileSync(join(__dirname, '/results/node.js')).toString(), 'correct node build')
      t.equal(results.browser, fs.readFileSync(join(__dirname, '/results/browser.js')).toString(), 'correct browser build')
      t.equal(results.inline, fs.readFileSync(join(__dirname, '/results/inline.js')).toString(), 'correct inline build')
      t.end()
    }
  })
})
