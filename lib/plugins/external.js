const exclude = require('../exclude')
const chalk = require('chalk') // for logging of deps
exports.condition = file => file.external || exclude(file.key)

exports.parse = file => new Promise((resolve, reject) => {
  const id = file.id.compute()
  if (exclude(file.key)) {
    const result = `var ${id} = require('${file.external || file.key}')`
    // can do fallbacks here (for example for buildins)
    resolve({ result, es5: result })
  } else {
    const js = file.root().plugins.js
    resolve(js.parse(file))
  }
})

exports.compile = (file, result, type, opts, traversed, module) => {
  const id = file.id.compute()
  if (traversed[id] && traversed[id].stamp === module.stamp) {
    // need to do an array if we want to choose the best version
    let str = `   ${chalk.blue(type)} double ${chalk.blue(file.external)} use ${chalk.blue(traversed[id].file.version)}`
    if (traversed[id].file.version !== file.version) {
      str += ` over ${chalk.blue(file.version)}`
    }
    return
  }
  traversed[id] = { file, stamp: module.stamp }
  if (
    type === 'inline' ||
    opts.inline && opts.inline.includes(file.external) ||
    file.virtual
  ) {
    result.code += '\n' + file.es5.compute()
  } else {
    result.code += '\n' + `var ${id} = require('${file.external}')`
  }
}
