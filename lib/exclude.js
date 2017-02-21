const builtin = require('is-builtin-module')

const defaults = [
  'uws',
  'redis',
  'promise-polyfill',
  'regenerator-runtime/runtime',
  'websocket',
  'html-element',
  'html-element/global-shim',
  'tape' // browserify it (make browserify plugin)
]

module.exports = path => {
  if (typeof path !== 'string') path = path.external || path.key
  if (builtin(path)) return true
  if (defaults.indexOf(path) !== -1) return true
}
