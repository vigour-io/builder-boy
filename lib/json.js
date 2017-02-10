const hash = require('string-hash')
const { parseCharIndex } = require('./util')

const json = code => new Promise((resolve, reject) => {
  const file = code.parent()
  const raw = code.compute()
  try {
    const parsed = JSON.parse(raw) //eslint-disable-line
    const id = '$' + hash(file.get([ 'resolvedFrom', 'compute' ]) || file.key)
    const result = `const ${id} = ${raw}`
    resolve({ code, dependencies: [], result })
  } catch (err) {
    let line = err.message.match(/position (\d+)$/)
    if (line) {
      let index = line[1] * 1 + 1
      err.message += parseCharIndex(raw, index)
    }
    reject(err)
  }
})

module.exports = json
