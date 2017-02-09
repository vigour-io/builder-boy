const { create } = require('brisky-struct')
const astwalker = require('./astwalker')
const bs = require('brisky-stamp')
const watch = require('./watch')
const { isExternal, isJSON } = require('./util')
// const chalk = require('chalk')
const external = require('./external')
const hash = require('string-hash')

const update = ({ dependencies, result, code, any, hasDefault }) => {
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
          external: dep.external || false
        }
      }, stamp)
    }

    boy.set({
      // have to check if a deps is external
      [node]: {
        val: true,
        external: dep.external || false
      }, // to spark first listener
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
  // boy.emit('error', err) -- if we want a global emitter for errors
}

const boy = create({
  inject: [ watch ],
  props: {
    default: {
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

const json = code => new Promise((resolve, reject) => {
  const file = code.parent()
  const raw = code.compute()
  try {
    const parsed = JSON.parse(raw) //eslint-disable-line
    const id = '$' + hash(file.get([ 'resolvedFrom', 'compute' ]) || file.key)
    const result = `const ${id} = ${raw}`
    resolve({ code, dependencies: [], result })
  } catch (err) {
    let line = err.message.match(/position (\d+)$/)
    if (line) {
      let cnt = 0
      let index = line[1] * 1 + 1
      const lines = raw.split('\n')
      for (let i = 0; i < lines.length; i++) {
        cnt += (lines[i].length + 1)
        if (index <= cnt) {
          let collumn = index - cnt + 1
          err.message += ` "(${i + 1}:${collumn})`
          break
        }
      }
    }
    reject(err)
  }
})

module.exports = boy
