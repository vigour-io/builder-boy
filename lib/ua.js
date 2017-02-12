var cnt = 0
const uids = {}
const lookUp = {}
const hash = require('string-hash')
// const combinations = {}

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

const parseTest = (val) => {
  // console.log(JSON.stringify(val, false, 2))
}

const parseua = (ua) => {
  var test = ua.test ? parseTest(ua.test) : []
  var final
  for (let key in ua) {
    if (key === 'alternate') {
      // let inversed = invert(test)
      // console.log('inversed', inversed)
    } else if (key !== 'test') {
      const nest = parseua(ua[key])
      const copy = []
      // now the cleanup ofcourse -- negation is hard
      nest.forEach(n => test.forEach(t => copy.push(t.concat(n))))
      final = test.concat(copy)
    }
  }
  return final || test
}

module.exports = ua => {
  console.log('ua:', JSON.stringify(ua, false, 2))
  for (var key in ua) {
    if (key !== 'hash') {
      console.log(parseua(ua[key]))
    }
  }

  // console.log(globalMap)
}
