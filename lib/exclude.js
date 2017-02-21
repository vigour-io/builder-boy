const builtin = require('is-builtin-module')

const defaults = [
  'uws',
  'redis',
  'node-fetch',
  'html-element',
  'html-element/global-shim',
  'tape' // browserify it (make browserify plugin)
]

module.exports = path => {
  if (typeof path !== 'string') {
    path = path.external || path.key
  }
  if (path.indexOf('EXCLUDE-') === 0) return true
  if (builtin(path)) return true
  if (defaults.indexOf(path) !== -1) return true
}
