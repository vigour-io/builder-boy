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
    val = cache
  } else {
    const parsed = parse(node.ua)
    if (!parsed) return
    val = parsed
  }

  const builds = {}
  val.forEach(val => {
    const str = JSON.stringify(val.ua, null, 2)
    val.id = hash(str)
    builds[val.id] = node.code.replace(file.code, `var ${file.val}=${str}`)
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
  const results = val.map(v => {
    const condition = generateAnd(v.condition)
    return `if (${condition}) {
    return ${v.id}
  }`
  })
  return `module.exports = function (ua) {
  ${results.join(' else ')}
}`
}

const generateComparison = (key, val) => {
  for (operator in val) {
    return operator === '$in' ? `~${JSON.stringify(val[operator])}.indexOf(ua.${key})`
      : operator === '$nin' ? `!~${JSON.stringify(val[operator])}.indexOf(ua.${key})`
      : `ua.${key} ${operator} ${JSON.stringify(val[operator])}`
  }
}

const generateOr = val => {
  const or = []
  var i = val.length
  while(i--) {
    let and = generateAnd(val[i])
    if (Object.keys(val[i]).length > 1) {
      and = `(${and})`
    }
    or.push(and)
  }
  return `(${or.join(' || ')})`
}

const generateAnd = val => {
  const and = []
  for (var key in val) {
    if (key === '$or') {
      and.push(generateOr(val[key]))
    } else if (key !== 'id') {
      and.push(generateComparison(key, val[key]))
    }
  }
  return and.join(' && ')
}
