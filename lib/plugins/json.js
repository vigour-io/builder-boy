const { parseCharIndex } = require('../log')

exports.parse = file => new Promise((resolve, reject) => {
  const raw = file.code.compute()
  try {
    const parsed = JSON.parse(raw) //eslint-disable-line
    const id = file.id.compute()
    const result = `var ${id} = ${raw}`
    resolve({ result })
  } catch (err) {
    let line = err.message.match(/position (\d+)$/)
    if (line) {
      let index = line[1] * 1 + 1
      err.message += parseCharIndex(raw, index)
    }
    reject(err)
  }
})

exports.condition = file => /\.json$/i.test(file.key)

exports.compile = (file, result, type, opts) => {
  result.code += '\n' + file.result.compute()
}
