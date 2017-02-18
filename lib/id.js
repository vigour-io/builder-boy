const hash = require('string-hash')
const { pathIsExternal } = require('./util')

module.exports = (file, path, imported) => {
  const input = path || (file.resolvedFrom ? file.resolvedFrom.compute() : file.key)

  if (
    file && file.external && file.external.compute() ||
    imported && pathIsExternal(imported)
  ) {
    console.log('XXXXXXXXXX', input)
    return '$EXTERNAL' + hash(imported || file && file.external && file.external.compute())
  }

  return '$' + hash(input)
}
