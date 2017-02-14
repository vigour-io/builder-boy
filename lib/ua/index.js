const parse = require('./parse')
const hash = require('string-hash')

const mem = {}

module.exports = (node) => {
  const version = hash(JSON.stringify(node.ua))

  const { val, fallback } = mem[version] || parse(node.ua)

  const left = node.code.slice(0, node.ua.hash.start)
  const right = node.code.slice(node.ua.hash.end)
  const builds = {}
  // also hash the result so you dont make new shit if its not nessecary -- something like that
  // make builds
  val.forEach(val => {
    const str = JSON.stringify(val.ua, false, 2)
    val.id = hash(str)
    builds[val.id] = `${left}\n // UA REPLACED\nvar ${node.ua.hash.val}=${str};${right}`
  })

  const result = {
    val,
    builds,
    select: mem[version] ? mem[version].select : generateSelect(val, fallback)
  }

  mem[version] = result
  return result
}

const generateSelect = (val, fallback) => {
  const results = []
  for (var i in val) {
    results.push(generateCondition(val[i]))
  }

  var raw = JSON.stringify(val.map(val => ({ id: val.id, ua: val.ua })), false, 2)

  var select = `var raw = ${raw}
  module.exports = function (ua) {
    ${results.join(' else ')} else {
      var devicesMatches = []
      for (var key in raw) {
        if (raw[key].ua.device === ua.device) {
          devicesMatches.push(raw[key])
        }
      }
      for (var i = 0, len = devicesMatches.length; i < len; i++) {
        if (devicesMatches[i].ua.platform === ua.platform || devicesMatches[i].ua.browser === ua.browser) {
          return devicesMatches[i].id
        }
      }
      return devicesMatches[0] ? devicesMatches[0].id : ${fallback.id}
    }
  }
`

  return select
}

const generateCondition = t => {
  var body = []
  for (var i in t) {
    // cleanup in a bit
    if (i !== 'ua' && i !== '_match' && i !== 'id') {
      // put correct operator
      // and remove unnsecary checks
      for (var j in t[i]) {
        let operator = '==='
        let split = typeof t[i][j] === 'string' ? t[i][j].split('|') : [ t[i][j] ]
        let val = split[0]
        if (split.length > 1) {
          operator = split[0]
          if (operator === '!') {
            operator = '!=='
          }
          val = split[1]
        }

        if (!isNaN(val * 1)) {
          val = val * 1
        } else if (typeof val === 'string') {
          val = `'${val}'`
        }
        body.push(`ua.${i} ${operator} ${val}`)
      }
    }
  }
  var result = `if (\n  ${body.join(' &&\n  ')}) {
  return ${t.id}
}`
  return result
}
