const { create } = require('brisky-struct')
const astwalker = require('./astwalker')
const bs = require('brisky-stamp')
const watch = require('./watch')
const hash = require('string-hash')
const { isExternal } = require('./util')
// const chalk = require('chalk')

const update = ({ dependencies, result, code, any, hasDefault }) => {
  const stamp = bs.create()
  const file = code.parent()
  const name = file.key

  dependencies.forEach(dep => {
    const node = dep.node
    const browser = dep.browser

    if (node !== browser) {
      boy.set({
        [browser]: { resolvedFrom: node }
      }, stamp)
    }

    // boy.set({
    //   [node]: true, // to spark first listener
    // })

    boy.set({
      // have to check if a deps is external
      [node]: true, // to spark first listener
      [name]: {
        browser: {
          [browser]: {
            val: [ '@', 'root', browser, 'result' ],
            on: {
              data: {
                deps: (val, stamp, t) => {
                  if (file.result) file.result.emit('data', val, stamp)
                }
              }
            }
          }
        },
        dependencies: {
          [node]: {
            val: [ '@', 'root', node, 'result' ],
            on: {
              data: {
                deps: (val, stamp, t) => {
                  if (file.result) file.result.emit('data', val, stamp)
                }
              }
            }
          }
        }
      }
    }, stamp)
  })

  // same trick for browser
  if (file.dependencies && file.dependencies.keys().length > dependencies.length) {
    const removal = []
    file.dependencies.forEach(dep => {
      if (dependencies.indexOf(dep.key) === -1) { removal.push(dep) }
    })
    removal.forEach(dep => dep.set(null, stamp))
  }
  // also do for browser!
  if (file.browser && file.browser.keys().length > dependencies.length) {
    const removal = []
    file.dependencies.forEach(dep => {
      if (dependencies.indexOf(dep.key) === -1) { removal.push(dep) }
    })
    removal.forEach(dep => dep.set(null, stamp))
  }

  bs.close()
  file.set({ result, any, hasDefault })
}

const onError = (err, code) => {
  err.file = code.parent().key
  code.parent().set({ result: { val: err } })
  // boy.emit('error', err)
}

const external = (code, modulename) => new Promise((resolve, reject) => {
  const dependencies = []
  const browser = []
  const file = code.parent()
  const id = '$' + hash(file.key)
  var result = `const ${id} = require('${modulename}')`
  resolve({ code, dependencies, browser, result })
})

const boy = create({
  inject: [ watch ],
  props: {
    default: {
      code: {
        val: '',
        on: {
          data: {
            parsecode (val, stamp, code) {
              if (val !== null) {
                // this is wrong need to think of something good for this...
                // like not resolve the path or something
                const modulename = isExternal(code.parent())
                if (modulename) {
                  // console.log(chalk.green('EXTERNAL'), modulename)
                  external(code, modulename).then(update).catch(err => onError(err, code))
                  // all deps yes
                } else {
                  // console.log('PARSECODE', code.parent().key)
                  astwalker(code)
                    .then(update)
                    .catch(err => {
                      onError(err, code)
                    })
                }
              }
            }
          }
        }
      }
    }
  }
})

module.exports = boy
