const { create } = require('brisky-struct')

const watch = require('./watch')
const update = require('./update')

// default plugins
const js = require('./plugins/js')
const json = require('./plugins/json')
const external = require('./plugins/external')

const onError = (err, code) => {
  err.file = code.parent().key
  code.parent().set({ result: { val: err } })
}

const genId = () => {}

  // import is there to determine if something is external
  // no import is automaticly flagged as external
  // top lvl needs browser resolve as well
  // boy.add({ import: 'require path', file }) // what if no file?

  // - import <--- listener that sets external -- prob best -- if listeners get is a bit shit to use -- also it becomes async (resolved) -- only relevant for code
  // - key === full-path
  // - resolved === node-key
  // - external === 'as required' // this only goes for the top one
  // - id() <-- hash based on from

const boy = create({
  inject: [ watch ],
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
      define: {
        id () {
          if (!this._id) {
            this._id = genId(this)
          }
          return this._id
        }
      },
      data: { // call this data ? its a file
        val: '',
        on: {
          data: {
            parse (val, stamp, data) {
              if (val !== null) {
                const file = data.parent()
                const plugins = data.root().plugins
                const keys = plugins.keys()
                var plugin
                for (let i = 0, len = keys.length; i < len; i++) {
                  if (plugins[keys[i]].condition && plugins[keys[i]].condition(file)) {
                    plugin = plugins[keys[i]].parse
                  }
                }
                if (!plugin) plugin = plugins.js
                plugin.parse(file)
                  .then(val => update(val, file))
                  .catch(err => onError(err, data))
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
