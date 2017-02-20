const { create } = require('brisky-struct')
const hash = require('string-hash')
const findPkg = require('find-pkg')
const path = require('path')
const fs = require('fs')
const exclude = require('./exclude')

const watch = require('./watch')
const browserResolve = require('./resolve')

// default plugins
const js = require('./plugins/js')
const json = require('./plugins/json')
const external = require('./plugins/external')

const onError = (err, code) => {
  err.file = code.parent().key
  code.parent().set({ result: { val: err } })
}

const pathIsExternal = dep => dep[0] !== '.' && dep[0] !== '/'

  // boy.add({ require: 'require path', from: file, real, val }) // what if no file?
  // - import <--- listener that sets external -- prob best -- if listeners get is a bit shit to use -- also it becomes async (resolved) -- only relevant for code
  // - key === full-path
  // -> external === 'as required' // this only goes for the top one -- has a transform
  // - id

const createId = ({ node, browser }, val) => new Promise((resolve, reject) => {
  if ((val && val.vritual) || exclude(node)) {
    resolve({ node, browser, id: node })
  } else {
    findPkg('.', (err, pkgPath) => {
      if (err) {
        reject(err)
      } else {
        fs.readFile(pkgPath, (err, data) => {
          if (err) {
            reject(err)
          } else {
            const name = JSON.parse(data.toString()).name
            pkgPath = pkgPath.split('/').slice(0, -1)
            const idpath = node.split('/').slice(pkgPath.length)
            idpath.unshift(name)
            const id = idpath.join('/')
            resolve({ node, browser, id })
          }
        })
      }
    })
  }
})

const resolvePaths = (require, from) => new Promise((resolve, reject) => {
  // also dont do node resolve if buildin will crash
  // exclude -- not nesscary to do any resolve / id

  // use virtual (so you can set a file there)
  // noderesolve(dep, { basedir: file.vritual ? false : dirname(file.key) }, (err, paths) => {

})

const boy = create({
  inject: [ watch ],
  define: {
    add ({ require, from, real, val }, stamp) {
      return new Promise((resolve, reject) => {
        if (real && this.get(real)) {
          resolve({
            node: this.get(real),
            browser: this.get(real)
          })
        } else {
          const result = real || exclude(require)
            ? createId({ node: real || require }, val)
            : resolvePaths(require, from)
                .then((paths) => createId(paths, val))

          result.then(({ node, browser, id }) => {
            if (!val) val = {}
            if (typeof val !== 'object') val = { val }
            if (!val.val) val.val = true
            val.inline = (require && (!pathIsExternal(require) && !exclude(require))) || (val && val.virtual)
            val.id = id // '$' + hash(id)
            this.set({ [node]: val })
            if (browser && browser !== node) {
              this.set({ [browser]: val })
            }
            resolve({
              node: this[node],
              browser: browser ? this[browser] : this[node]
            })
          }).catch(err => reject(err))
        }
      })
    }
  },
  props: {
    plugins: {
      type: 'struct',
      props: {
        default: {
          props: {
            condition: true,
            parse: true,
            compile: true
          }
        }
      }
    },
    default: {
      code: {
        val: '',
        on: {
          data: {
            parse (val, stamp, code) {
              if (val !== null) {
                const file = code.parent()
                const plugins = code.root().plugins
                const keys = plugins.keys()
                var plugin
                for (let i = 0, len = keys.length; i < len; i++) {
                  if (plugins[keys[i]].condition && plugins[keys[i]].condition(file)) {
                    plugin = plugins[keys[i]].parse
                  }
                }
                if (!plugin) plugin = plugins.js
                plugin.parse(file)
                  .then(val => file.set(val))
                  .catch(err => onError(err, code))
              }
            }
          }
        }
      }
    }
  },
  plugins: {
    js,
    json,
    external
  }
})

module.exports = boy
