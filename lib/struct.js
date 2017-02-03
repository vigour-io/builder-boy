const { create } = require('brisky-struct')
const astwalker = require('./astwalker')
const bs = require('brisky-stamp')
const watch = require('./watch')

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
                astwalker(code)
                  .then(({ dependencies, result }) => {
                    const stamp = bs.create()
                    const file = code.parent()
                    const name = file.key

                    dependencies.forEach(dep => boy.set({
                      [dep]: true, // to spark first listener
                      [name]: {
                        dependencies: {
                          [dep]: {
                            val: [ '@', 'root', dep, 'result' ],
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
                    }, stamp))

                    if (file.dependencies && file.dependencies.keys().length > dependencies.length) {
                      const removal = []
                      // check if for each works with removing now...
                      file.dependencies.forEach(dep => {
                        if (dependencies.indexOf(dep.key) === -1) { removal.push(dep) }
                      })
                      removal.forEach(dep => dep.set(null, stamp))
                    }
                    file.set({ result, error: false }, stamp)
                    bs.close()
                  })
                  .catch(err => {
                    err.file = code.parent().key
                    code.parent().set({
                      error: { val: err },
                      result: err.message
                    })
                    boy.emit('error', err)
                  })
              }
            }
          }
        }
      }
    }
  }
})

module.exports = boy
