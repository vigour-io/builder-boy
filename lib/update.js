const bs = require('brisky-stamp')
const boy = require('./boy')

const update = ({ dependencies = [], result }, file) => {
  const stamp = bs.create()
  const key = file.key

  dependencies.forEach(dep => {
    const node = dep.node
    const browser = dep.browser
    if (node !== browser) {
      // resolved is not enough <-- need to get it from pkg.json of course
      boy.set({
        [browser]: {
          val: true,
          resolved: node, // needs to find first pkg.json
          external: dep.external || {}
        }
      }, stamp)
    }

    boy.set({
      [node]: {
        val: true,
        external: dep.external || {}
      },
      [key]: {
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

  // remove deps
  removeDependencies(file.dependencies, dependencies, stamp)
  removeDependencies(file.browser, dependencies, stamp)

  file.set(result)
}

const removeDependencies = (field, dependencies, stamp) => {
  if (field && field.keys().length > dependencies.length) {
    const removal = []
    field.forEach(dep => {
      if (~dependencies.indexOf(dep.key)) removal.push(dep)
    })
    removal.forEach(dep => dep.set(null, stamp))
  }
}

module.exports = update
