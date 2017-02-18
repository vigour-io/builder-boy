const noderesolve = require('../resolve')
const { dirname } = require('path')
const builtin = require('is-builtin-module')
const { parseCharIndex, pathIsExternal } = require('../util')
const id = require('../id')

const setVars = imports => {
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
}

const prepImports = (imports, file, computed) => new Promise((resolve, reject) => {
  const dep = imports.file

  if (!dep) {
    throw new Error(
      'Import parse error' + parseCharIndex(computed, imports.start, imports.end)
    )
  }

  if (pathIsExternal(dep)) imports.isExternal = imports.file

  if (builtin(dep)) {
    const paths = {}
    paths.node = 'buildin-' + imports.isExternal
    paths.browser = 'buildin-' + imports.isExternal
    paths.external = { node: paths.node, browser: paths.browser, val: imports.file }
    imports.id = id(false, paths.node, dep)
    setVars(imports)
    resolve(paths)
  } else {
    try {
      // check if deps on boy -- if virtual
      noderesolve(dep, { basedir: file.vritual ? false : dirname(file.key) }, (err, paths) => {
        if (err) {
          const r = file.root().get(imports.file)
          if (r && r.virtual) {
            paths = {
              node: imports.file,
              browser: imports.file
            }
          } else {
            let cnt = 0
            cnt++
            const lines = computed.split('\n')
            for (let i = 0; i < lines.length; i++) {
              cnt += (lines[i].length)
              if (cnt > imports.start) {
                err.message += ` "${dep}" (${i + 1}:0)`
                break
              }
            }
            reject(err)
            return
          }
        }

        if (imports.isExternal) {
          paths.external = { val: imports.file, node: paths.node, browser: paths.browser }
        }

        imports.id = id(false, paths.node, dep)
        setVars(imports)

        resolve(paths)
      })
    } catch (e) {
      reject(e)
    }
  }
})

module.exports = prepImports
