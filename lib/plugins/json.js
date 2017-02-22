const { parseJSONError } = require('../log')

exports.parse = file => new Promise((resolve, reject) => {
  const raw = file.code.compute()
  try {
    const parsed = JSON.parse(raw) //eslint-disable-line
    const id = file.id.compute()
    const result = `var ${id} = ${raw}`
    resolve({ result })
  } catch (err) {
    parseJSONError(raw, err)
    reject(err)
  }
})

exports.condition = file => /\.json$/i.test(file.key)

exports.compile = (file, result, type, opts) => {
  result.code.push(file.result.compute())
}
