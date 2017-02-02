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
                      [name]: {
                        dependencies: {
                          [dep]: true
                        }
                      },
                      [dep]: {
                        dependents: {
                          [name]: true
                        }
                      }
                    }, stamp))
                    file.set({ result }, stamp)
                  })
                  .catch(err => console.log(err))
              }
            }
          }
        }
      }
    }
  }
})

module.exports = boy
