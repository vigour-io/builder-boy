const build = require('../')
const test = require('tape')
const { testBuild, generate } = require('./util') //eslint-disable-line

test('jsx-switch-path', t => {
  build('./test/jsx-switch-path/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-switch-path', results, t)
      t.end()
    }
  })
})

test('jsx-any', t => {
  build('./test/jsx-any/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-any', results, t)
      t.end()
    }
  })
})

test('jsx-basic-paths', t => {
  build('./test/jsx-basic-paths/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-basic-paths', results, t)
      t.end()
    }
  })
})

test('imports', t => {
  build('./test/imports/a.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('imports', results, t)
      t.end()
    }
  })
})

test('jsx-nocompute', t => {
  build('./test/jsx-nocompute/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-nocompute', results, t)
      t.end()
    }
  })
})

test('jsx-type', t => {
  build('./test/jsx-type/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-type', results, t)
      t.end()
    }
  })
})

test('jsx-attributes', t => {
  build('./test/jsx-attributes/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-attributes', results, t)
      t.end()
    }
  })
})

test('jsx-switcher', t => {
  build('./test/jsx-switcher/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-switcher', results, t)
      t.end()
    }
  })
})

test('jsx-type', t => {
  build('./test/jsx-type/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      generate('jsx-type', results, t)
      t.end()
    }
  })
})

test('simple', t => {
  build('./test/basic/a.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('basic', results, t)
      t.end()
    }
  })
})

// test('polyfill', t => {
//   build('./test/polyfill/a.js', { nowatch: true }, (err, results, boy) => {
//     if (!err) {
//       testBuild('polyfill', results, t)
//       t.end()
//     }
//   })
// })

test('env - override', t => {
  build('./test/env/index.js', {
    nowatch: true,
    targets: [ 'inline' ],
    env: { beurs: 'ha!' }
  }, (err, results, boy) => {
    if (!err) {
      testBuild('env', results, t)
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
      testBuild('env', results, t)
      t.end()
    }
  })
})

test('virtual', t => {
  build({
    virtual: {
      virtual: true,
      code: 'export default \'hahaha\''
    }
  }, { nowatch: true }, (err, results, boy) => {
    if (!err) {
      build('./test/virtual/index.js', { nowatch: true }, (err, results, boy) => {
        if (!err) {
          testBuild('virtual', results, t)
          t.end()
        }
      })
    }
  })
})

test('package - error', t => {
  build('./test/pkg/index.js', {
    nowatch: true,
    targets: [ 'node' ]
  }, (err, results, boy) => {
    if (err) {
      t.ok(err.file.indexOf('package.json') !== -1, 'err gets file path')
      t.end()
    }
  })
})

test('json', t => {
  build('./test/json/index.js', {
    nowatch: true,
    targets: [ 'node' ]
  }, (err, results, boy) => {
    if (!err) {
      testBuild('json', results, t)
      t.end()
    }
  })
})

test('error', t => {
  build('./test/error/index.js', {
    nowatch: true,
    targets: [ 'node' ]
  }, (err, results, boy) => {
    if (err) {
      t.equal(err.message, 'Cannot find module "hello" (1:0)')
      t.end()
    }
  })
})

test('nested', t => {
  build('./test/nested/index.js', {
    nowatch: true,
    targets: [ 'inline' ]
  }, (err, results, boy) => {
    if (!err) {
      testBuild('nested', results, t)
      t.end()
    }
  })
})

test('jsx-body', t => {
  build('./test/jsx-body/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-body', results, t)
      t.end()
    }
  })
})

test('jsx-basic', t => {
  build('./test/jsx-basic/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-basic', results, t)
      t.end()
    } else {
      console.log(err)
    }
  })
})

test('jsx-multi', t => {
  build('./test/jsx-multi/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-multi', results, t)
      t.end()
    } else {
      console.log(err)
    }
  })
})

test('jsx-object', t => {
  build('./test/jsx-object/index.js', { nowatch: true }, (err, results, boy) => {
    if (!err) {
      testBuild('jsx-object', results, t)
      t.end()
    } else {
      console.log(err)
    }
  })
})

// -- need to re-enable these things---

// test('ua/basic', t => {
//   build('./test/ua/basic/index.js', {
//     nowatch: true,
//     targets: [ 'node' ]
//   }, (err, results, boy) => {
//     console.log(results.ua.node.select)
//     if (!err) {
//       testBuild('ua/basic', results.ua.node.builds, t)
//       t.end()
//     }
//   })
// })

// test('ua/versions', t => {
//   build('./test/ua/versions/index.js', {
//     nowatch: true,
//     targets: [ 'node' ]
//   }, (err, results, boy) => {
//     console.log(results.ua.node.select)
//     if (!err) {
//       testBuild('ua/versions', results.ua.node.builds, t)
//       t.end()
//     }
//   })
// })

// test('ua/coverage', t => {
//   build('./test/ua/coverage/index.js', {
//     nowatch: true,
//     targets: [ 'node' ]
//   }, (err, results, boy) => {
//     if (!err) {
//       testBuild('ua/coverage', results.ua.node.builds, t)
//       t.end()
//     }
//   })
// })