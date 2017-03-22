const s = require('stamp')

const setDependencies = (dependencies = [], file) => {
  const stamp = s.create()
  const key = file.key

  dependencies.forEach(dep => {
    const node = dep.node
    const browser = dep.browser
    const boy = file.root()

    boy.set({
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

  removeDependencies(file.dependencies, dependencies, stamp)
  removeDependencies(file.browser, dependencies, stamp)
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

module.exports = setDependencies
