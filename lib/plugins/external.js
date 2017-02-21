const exclude = require('../exclude')
const chalk = require('chalk') // for logging of deps
exports.condition = file => file.external || exclude(file.key)

// here were using exclude
exports.parse = file => new Promise((resolve, reject) => {
  const id = file.id.compute()
  if (exclude(file.key)) {
    const result = `var ${id} = require('${file.external || file.key}')`
    resolve({ result, es5: result })
    // can do fallbacks here (for example for buildins)
  } else {
    const js = file.root().plugins.js
    resolve(js.parse(file))
  }
})

exports.compile = (file, result, type, opts, traversed) => {
  const id = file.id.compute()
  if (traversed[id]) {
    if (traversed[id].ignore) return
    traversed[id].ignore = true
    // need to do an array if we want to choose the best version
    let str = `   double ${chalk.blue(file.external)} use ${chalk.blue(traversed[id].file.version)}`
    if (traversed[id].file.version !== file.version) {
      str += ` over ${chalk.blue(file.version)}`
    }
    console.log(str)
    return
  }
  traversed[id] = { file }

  if (type === 'inline' || opts.inline && opts.inline.includes(file.external)) {
    result.code += '\n' + file.es5.compute()
  } else {
    result.code += '\n' + `var ${id} = require('${file.external}')`
  }
}
