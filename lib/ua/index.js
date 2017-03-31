const parse = require('./parse')
const hash = require('string-hash')
const mem = {}

module.exports = (node) => {
  const file = node.ua.file

  delete node.ua.file
  delete node.ua.uid

  const version = hash(JSON.stringify(node.ua))

  if (mem[version]) {
    console.log('ua from cache', version)
  }

  const cache = mem[version]

  var val

  if (cache) {
    val = cache.val
  } else {
    const parsed = parse(node.ua)
    if (!parsed) return
    val = parsed
  }

  const builds = {}
  val.forEach(val => {
    val.id = hash(val.ua)
    builds[val.id] = node.code.replace(file.code, `var ${file.val}=${val.ua}`)
  })

  const result = {
    val,
    builds,
    select: cache ? cache.select : generateSelect(val)
  }

  mem[version] = result
  return result
}

const generateSelect = val => {
  var results = val.map(v => {
    const condition = generateCondition(v.condition)
    return `if (${condition}) {
    return ${v.id}
  }`
  })
  results = `module.exports = function (ua) {
  ${results.join(' else ')}
}`
  return results
}

const generateComparison = (key, operator, val) => {
  return operator === '$in' && val.length > 1 ? `~${JSON.stringify(val)}.indexOf(ua.${key})`
    : operator === '$in' ? `ua.${key} === ${JSON.stringify(val[0])}`
    : operator === '$nin' && val.length > 1 ? `!~${JSON.stringify(val)}.indexOf(ua.${key})`
    : operator === '$nin' ? `ua.${key} !== ${JSON.stringify(val[0])}`
    : `ua.${key} ${operator} ${JSON.stringify(val)}`
}

const generateCondition = val => {
  const and = []
  if (val.$or) {
    let i = val.$or.length
    while (i--) {
      let or = []
      let j = val.$or[i].length
      while (j--) {
        or.push(generateCondition(val.$or[i][j]))
      }
      and.push(`(${or.join(' || ')})`)
    }
  }
  for (var key in val) {
    if (key !== '$or') {
      for (let operator in val[key]) {
        and.push(generateComparison(key, operator, val[key][operator]))
      }
    }
  }
  return and.join(' && ')
}
