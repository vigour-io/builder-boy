const builtin = require('is-builtin-module')

const defaults = [
  'uws',
  'redis',
  // 'promise-polyfill', // this is wrong as well...
  // 'regenerator-runtime/runtime',
  'html-element',
  'html-element/global-shim',
  'tape' // browserify it (make browserify plugin)
]

module.exports = path => {
  if (typeof path !== 'string') path = path.external || path.key
  if (builtin(path)) return true
  if (defaults.indexOf(path) !== -1) return true
}
