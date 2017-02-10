const isExternal = file => file.get([ 'external', 'compute' ])

const isJSON = file => /\.json$/i.test(file.key)

const parseCharIndex = (str, index, end) => {
  if (!end) end = index + 1
  let cnt = 0
  const lines = str.split('\n')
  for (let i = 0; i < lines.length; i++) {
    cnt += (lines[i].length + 1)
    if (index <= cnt) {
      return ` (${i + 1}:${Math.max(cnt - index, 0)})`
    }
  }
}

exports.parseCharIndex = parseCharIndex
exports.isExternal = isExternal
exports.isJSON = isJSON
