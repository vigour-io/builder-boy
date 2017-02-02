const boy = require('../lib')

boy.build('./test/simple/index.js', './test/simple/dist/index.js').then(val => {
  require('./simple/dist/index.js')
})