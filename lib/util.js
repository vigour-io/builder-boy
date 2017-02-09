const isExternal = file => file.get([ 'external', 'compute' ])

// from resolve ? :X
const isJSON = file => /\.json$/i.test(file.key)
exports.isExternal = isExternal
exports.isJSON = isJSON
