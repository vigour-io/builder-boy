const { create } = require('brisky-struct')
const astwalker = require('./ast')
const bs = require('brisky-stamp')
const watch = require('./watch')
const { isExternal, isJSON } = require('./util')
const external = require('./external')
const json = require('./json')
const chalk = require('chalk') //eslint-disable-line
const genId = require('./id')

const update = ({ dependencies, result, code, any, hasDefault, es5, uaResult, envResult }) => {
  const stamp = bs.create()
  const file = code.parent()
  const name = file.key

  dependencies.forEach(dep => {
    const node = dep.node
    const browser = dep.browser

    if (node !== browser) {
      boy.set({
        [browser]: {
          val: true,
          resolvedFrom: node, // so its browser
          external: dep.external || {}
        }
      }, stamp)
    }

    boy.set({
      // have to check if a deps is external
      [node]: {
        val: true, // to spark first listener
        external: dep.external || {}
      },
      [name]: {
        browser: {
          [browser]: {
            val: [ '@', 'root', browser, 'result' ],
            on: {
              data: {
                deps: (val, stamp, t) => {
                  if (file.result) {
                    file.result.emit('data', val, stamp)
                  }
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
                  if (file.result) {
                    file.result.emit('data', val, stamp)
                  }
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

  file.set({ result, es5, any, hasDefault, uaResult, env: envResult })
}

const onError = (err, code) => {
  err.file = code.parent().key
  code.parent().set({ result: { val: err } })
  // boy.emit('error', err) -- if we want a global emitter for errors
}

const boy = create({
  inject: [ watch ],
  props: {
    default: {
      define: {
        id () {
          if (!this._id) {
            this._id = genId(this)
          }
          return this._id
        }
      },
      props: {
        virtual: true,
        uaResult: true,
        env: true
      },
      external: {
        on: {
          data: {
            external: (val, stamp, code) => {
              if (val) {
                // were allways going to check for conflicts
                // const node = code.get('node', '').compute()
                // const browser = code.get('browser', '').compute()
                // this will be the place for resolvement
                // also need to set version for external!
                // console.log('\n', chalk.green('external'), code.parent().key)
                // console.log(' browser:', browser)
                // console.log('    node:', node)
              } else if (val === false) {
                // console.log('!@#!@#!@#!@#!@#', coe.parent().key)
              }
            }
          }
        }
      },
      code: {
        val: '',
        on: {
          data: {
            parsecode (val, stamp, code) {
              if (val !== null) {
                if (isJSON(code.parent())) {
                  json(code).then(update).catch(err => onError(err, code))
                } else if (isExternal(code.parent())) {
                  external(code).then(update).catch(err => onError(err, code))
                } else {
                  astwalker(code).then(update).catch(err => onError(err, code))
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
