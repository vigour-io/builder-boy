// const builtin = require('is-builtin-module')
const noderesolve = require('./resolve')
const { dirname } = require('path')
const hash = require('string-hash')
const builtin = require('is-builtin-module')

const prepImports = (imports, file, computed) => new Promise((resolve, reject) => {
  const dep = imports.file

  if (!(dep[0] === '.' && (dep[1] === '/' || (dep[1] === '.' && dep[2] === '/')))) {
    // console.log('  🚚  is external ', dep)
    imports.isExternal = 'external-' + imports.file
  }

  if (builtin(dep)) {
    const paths = {
      node: 'fs',
      browser: 'fs' // build inline
    }
    paths.external = { node: paths.node, browser: paths.browser }
    paths.node = imports.isExternal
    paths.browser = imports.isExternal
    imports.vars = {}
    imports.id = '$' + hash(paths.node)

    console.log(imports.isExternal)

    resolve(paths)
  } else {
    try {
      noderesolve(dep, { basedir: dirname(file.key) }, (err, paths) => {
        if (err) {
          let cnt = 0
          cnt++
          const lines = computed.split('\n')
          for (let i = 0; i < lines.length; i++) {
            cnt += (lines[i].length)
            if (cnt > imports.start) {
              err.message += ` "${dep}" (${(i + 1)}:0)`
              break
            }
          }
          reject(err)
          return
        }

        imports.file = paths.node

        if (imports.isExternal) {
          paths.external = { node: paths.node, browser: paths.browser }
          paths.node = imports.isExternal
          paths.browser = imports.isExternal
        }

        imports.id = '$' + hash(paths.node)

        if (imports.exports) {
          imports.vars = {}
          if (imports.exports['*']) {
            imports.vars[imports.exports['*']] = imports.id + '_$ALL$'
          } else if (imports.exports.default) {
            imports.vars[imports.exports.default] = imports.id
          } else {
            for (let i in imports.exports) {
              if (i !== 'default' && i !== '*') {
                const seperator = imports.isExternal ? '.' : '_'
                imports.vars[imports.exports[i][0]] = `${imports.id}${seperator}${imports.exports[i][1]}`
              }
            }
          }
        }
        resolve(paths)
      })
    } catch (e) {
      reject(e)
    }
  }
})

module.exports = prepImports
