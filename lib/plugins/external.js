const exclude = require('../exclude')
const chalk = require('chalk') // for logging of deps
exports.condition = file => file.external || exclude(file.key)

// here were using exclude
exports.parse = file => new Promise((resolve, reject) => {
  const id = file.id.compute()
  if (exclude(file.key)) {
    const result = `var ${id} = require('${file.external || file.key}')`
    resolve({
      result,
      es5: result, // can do fallbacks here (for example for buildins)
      commonjs: result
    })
  } else {
    const js = file.root().plugins.js
    file.set({ commonjs: `var ${id} = require('${file.external}')` })
    resolve(js.parse(file))
  }
})

exports.compile = (file, result, type, opts, traversed) => {
  // opts.inline || node modules || ua
  if (type === 'inline') {
    result.code += '\n' + file.es5.compute()
  } else {
    result.code += '\n' + file.commonjs.compute()
  }
}
