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
    const str = JSON.stringify(val, null, 2)
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
  const results = []
  for (var i in val) {
    results.push(generateCondition(val[i]))
  }
  var raw = JSON.stringify(val.map(val => ({ id: val.id, ua: val.ua })), null, 2)
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
        // webview is a bit tricky....
        if (devicesMatches[i].ua.webview === ua.webview) {
          if (!fallback) fallback = devicesMatches[i].id
          if(ua.webview && (devicesMatches[i].ua.platform === ua.platform || devicesMatches[i].ua.browser === ua.browser)) {
            return devicesMatches[i].id
          }
        }
      }
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
