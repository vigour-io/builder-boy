var cnt = 0 //eslint-disable-line
const uids = {}
const lookUp = {}
// const hash = require('string-hash')
const list = require('vigour-ua/test/common/useragents/list')
const ua = require('vigour-ua')
const uas = []

for (var i in list) {
  list[i].forEach(val => {
    uas.push(ua(val))
  })
}

const uid = num => {
  const div = num / 26 | 0
  var str = String.fromCharCode(97 + num % 26)
  if (div) {
    if (div / 26 | 0) {
      str = str + uid(div)
    } else {
      str = str + String.fromCharCode(97 + div % 26)
    }
  }
  return str
}

const isOperator = x => x === '===' ||
  x === '>' ||
  x === '<' ||
  x === '==' ||
  x === '!=' ||
  x === '!==' ||
  x === '>=' ||
  x === '<='

const invertOperator = (operator) => {
  let inverse
  if (operator === '===') {
    inverse = '!=='
  } else if (operator === '!==') {
    inverse = '==='
  } else if (operator === '>') {
    inverse = '<='
  } else if (operator === '<') {
    inverse = '>='
  } else if (operator === '<=') {
    inverse = '>'
  } else if (operator === '>=') {
    inverse = '<'
  } else if (operator === '==') {
    inverse = '!='
  } else if (operator === '!=') {
    inverse = '=='
  }
  return inverse
}

const parseOperator = (operator, variable, val) => {
  const parsed = variable + operator + val
  if (!uids[parsed]) {
    uids[parsed] = parsed
    // uids[parsed] = uid(cnt++)
    lookUp[uids[parsed]] = { variable, operator, val }
  }
  return uids[parsed]
}

const invertComparison = (comparison) => {
  const { operator, variable, val } = lookUp[comparison]
  let inverse = invertOperator(operator)
  return parseOperator(inverse, variable, val)
}

const inverseNext = (test, results, arr = [], index = 0) => {
  for (let i = 0; i < test[index].length; i++) {
    const a = arr.concat([ invertComparison(test[index][i]) ])
    if (index === test.length - 1) {
      results.push(a)
    } else {
      inverseNext(test, results, a, index + 1)
    }
  }
}

const invert = test => {
  if (test) {
    const results = []
    inverseNext(test, results)
    return results
  }
}

const preParse = (val, variable) => {
  const branches = []
  val.forEach(t => {
    const results = {}
    for (let key in t) {
      if (isOperator(key)) {
        results.val = (parseOperator(key, variable, t[key]))
      } else {
        const ret = preParse(t[key], key)
        for (var i in ret) {
          results[key + '-' + i] = ret[i]
        }
      }
    }
    branches.push(results)
  })
  return branches
}

const parse = (val, results, arr) => {
  if (val.val) {
    if (!arr) {
      arr = [ val.val ]
      results.push(arr)
    } else {
      arr.push(val.val)
    }
  }
  const prev = 0
  for (var i in val) {
    if (i !== 'val') {
      const nr = i.split('-')[1]
      if (nr == prev) { //eslint-disable-line
        parse(val[i], results, arr)
      } else {
        const n = []
        results.push(n)
        parse(val[i], results, n)
      }
    }
  }
  return arr
}

const parseTest = (val) => {
  const x = preParse(val)[0]
  const r = []
  parse(x, r)
  return r
}

const parseua = (ua) => {
  const result = {}
  var test = ua.test ? parseTest(ua.test) : []
  var final
  for (let key in ua) {
    if (key === 'alternate') {
      var inversed = invert(test)
      const a = parseua(ua[key]).test
      if (a) {
        const copy = []
        a.forEach(n => inversed.forEach(t => copy.push(t.concat(n))))
        inversed = copy
      }
      result.inversed = inversed
    } else if (key !== 'test') {
      // const nest = parseua(ua[key]).test
      // const copy = []
      // // now the cleanup ofcourse -- negation is hard
      // result.test = final || test
      // // do negation later for this one
      // nest.forEach(n => test.forEach(t => copy.push(t.concat(n))))
      // final = test.concat(copy)
    }
  }
  result.test = final || test
  return result
}

module.exports = ua => {
  // console.log('ua:', JSON.stringify(ua, false, 2))
  const total = []
  for (var key in ua) {
    if (key !== 'hash') {
      total.push(parseua(ua[key]))
    }
  }
  var a = []
  total.forEach(val => {
    if (val.test.length) {
      a.push(val.test)
    }
    if (val.inversed) {
      a.push(val.inversed)
    }
  })
  cleanup(a)
  a = a.filter(val => !!val.length)
  uas.forEach(val => {
    val.cnt = []
    scoreUa(a, val)
  })
  // console.log(uas)
  for (var i in a) {
    console.log(i, a[i])
    console.log('------------------------------------------------')
  }

  console.log(uas.map(val => val.cnt))
  console.log(uas.map(val => val.browser))
}

const fillInValue = (obj, b) => {
  for (let z = 0, len = b.length; z < len; z++) {
    const r = lookUp[b[z]]
    const op = r.operator
    if (op === '===') {
      obj[r.variable] = r.val
    } else if (op === '!==') {
      obj[r.variable] = '!' + r.val
    } else if (op === '<' || op === '<=' || op === '>=' || op === '>') {
      obj[r.variable] = op + r.val
    }
  }
}

const scoreUa = (a, obj) => {
  for (let n = 0, len = a.length; n < len; n++) {
    const c = a[n]
    for (let d = 0, len = c.length; d < len; d++) {
      let x = {}
      fillInValue(x, c[d])
      let colished
      for (let i in obj) {
        if (x[i]) {
          if (obj[i] !== x[i]) {
            if (x[i][0] === '<=' && x[i].slice(1) * 1 <= obj[i]) {
            } else if (x[i][0] === '>=' && x[i].slice(1) * 1 >= obj[i]) {
            } else if (x[i][0] === '>' && x[i].slice(1) * 1 > obj[i]) {
            } else if (x[i][0] === '<' && x[i].slice(1) * 1 < obj[i]) {
            } else if (obj[i][0] === '!') {
            } else if (x[i][0] === '!') {
            } else {
              colished = true
            }
          }
        }
      }
      if (!colished) {
        obj.cnt.push(n)
        break
      }
    }
  }
}

const cleanup = (a) => {
  a.forEach(val => {
    val.forEach(t => {
      t.forEach((val, index) => {
        const { operator, variable } = lookUp[val]
        for (let i = index + 1, len = t.length; i < len; i++) {
          let x = lookUp[t[i]]
          if (x.variable === variable) {
            // no negations yet for < >
            if (operator === '!==' && x.operator === '===') {
              t.splice(index, 1) // handle looping...
              len--
              i--
            } else if (operator === '===' && x.operator === '!==') {
              t.splice(i, 1)
              len--
              i--
            }
          }
        }
      })
    })
  })
}
