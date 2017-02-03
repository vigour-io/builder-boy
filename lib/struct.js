const { create } = require('brisky-struct')
const astwalker = require('./astwalker')
const bs = require('brisky-stamp')
const watch = require('./watch')
const hash = require('string-hash')
const { isExternal } = require('./util')
const chalk = require('chalk')

const update = ({ dependencies, result, code }) => {
  const stamp = bs.create()
  const file = code.parent()
  const name = file.key

  dependencies.forEach(dep => boy.set({
    // have to check if a deps is external
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

  console.log(chalk.white('---- RESULT'), file.key, !!result)
  file.set({ result, error: false })
  // bs.close()
}

const onError = (err, code) => {
  err.file = code.parent().key
  code.parent().set({
    error: { val: err },
    result: err.message
  })
  boy.emit('error', err)
}

const external = (code, modulename) => new Promise((resolve, reject) => {
  const dependencies = []
  const file = code.parent()
  const id = '$' + hash(file.key) // can be memoized
  // var result = `const ${id} = \`'EXTERNAL ${code.parent().key}'\``
  var result = `const ${id} = require('${modulename}')`
  resolve({ code, dependencies, result })
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
                const modulename = isExternal(code.parent())
                if (modulename) {
                  console.log(chalk.green('EXTERNAL'), modulename)
                  external(code, modulename).then(update).catch(err => onError(err, code))
                  // all deps yes
                } else {
                  console.log('PARSECODE', code.parent().key)
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
