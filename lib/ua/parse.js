const uids = {}
const lookUp = {}

const list = require('vigour-ua/test/common/useragents/list')
const ua = require('vigour-ua')
const uas = []

for (var i in list) {
  list[i].forEach(val => {
    uas.push(ua(val))
  })
}

const isOperator = x => x === '===' ||
  x === '>' ||
  x === '<' ||
  x === '==' ||
  x === '!=' ||
  x === '!==' ||
  x === '>=' ||
  x === '<='

const invertOperator = operator => {
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
    lookUp[uids[parsed]] = { variable, operator, val }
  }
  return uids[parsed]
}

const invertComparison = comparison => {
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

// --------------- needs to be fixed not complete! -----------------
// probably nice to make this part of builder boy
// rest goes away
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

const parseTest = val => {
  const r = []
  // this can become a lot better
  parse(preParse(val)[0], r)
  return r
}
// ----------------------------------------------------------------

const parseua = ua => {
  const result = {}
  var test = ua.test ? parseTest(ua.test) : []
  var final
  for (let key in ua) {
    if (key === 'alternate') {
      var inversed = invert(test)
      const a = parseua(ua[key]).test
      if (a && a.length) {
        const copy = []
        a.forEach(n => inversed.forEach(t => copy.push(t.concat(n))))
        inversed = copy
      }
      result.inversed = inversed
    } else if (key !== 'test') {
      // this is very specific for the ua usage now (which may be the only thing nessecary)
      // make it for builder boy so make it a seperate condition (vs adding it as a nested one)
      // means you have to add the orginal to the this one
      // for alternate its the same basicly
      const { test: nest, inversed: nestInverse } = parseua(ua[key])
      // NESTED IFS
      // needs to be parsed as well
      if (nestInverse) {
        if (nestInverse.length) {
          const copy = []
          nestInverse.forEach(n => test.forEach(t => copy.push(t.concat(n))))
          final = test.concat(copy)
        }
      }

      if (nest.length) {
        const copy = []
        nest.forEach(n => test.forEach(t => copy.push(t.concat(n))))
        final = (final || test).concat(copy)
      }
    }
  }
  result.test = final || test
  return result
}

const finalResults = (results, clean) => {
  // remove duplicates
  for (let i = 0, len = results.length; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (results[i] && results[j] && isEqual(results[i]._match, results[j]._match)) {
        results.splice(j, 1)
        len--
        i--
        j--
      }
    }
  }

  results.sort((a, b) => b._match.length - a._match.length)

  // const matchIt = (match, final, result, list) => {
  //   // let pass
  //   // for (let j = 0, len = match.length; j < len; j++) {
  //   //   const index = list.indexOf(match[j])
  //   //   // if (index !== -1) {
  //   //   //   list.splice(index, 1)
  //   //   //   pass = true
  //   //   // }
  //   //   pass = true
  //   // }
  //   // if (pass) {
  //   final.push(result)
  //   // }
  // }

  // const list = clean.map((val, key) => key)
  // for (let i = 0, len = results.length; i < len; i++) {
  //   // const match = results[i]._match
  //   final.push(results[i])
  // }

  return { val: results, fallback: results[0] }
}

const passTest = (obj, compare) => {
  for (let i in obj.ua) {
    if (compare[i]) {
      const val = obj.ua[i]
      if (val != compare[i]) { // eslint-disable-line
        const split = typeof compare[i] === 'string' && compare[i].split('|')
        const operator = split && split[1] ? split[0] : false
        const val2 = operator ? split[1] : compare[i]
        // if >= || > etc lest change to minmal or just copy val
        // same for ! (like an override)
        if (
          operator === '>=' && (!(val * 1 >= val2 * 1)) ||
          operator === '>' && (!(val * 1 > val2 * 1)) ||
          operator === '<' && (!(val * 1 < val2 * 1)) ||
          operator === '<=' && (!(val * 1 <= val2 * 1)) ||
          operator === '!' && (val == val2) || // eslint-disable-line
          (!operator && val !== val2)
        ) {
          return false
        } else {
          if (!obj[i]) obj[i] = []
          if (!obj[i].includes(compare[i])) {
            obj[i].push(compare[i])
          }
        }
      } else {
        obj[i] = [ val ]
      }
    }
  }
  return true
}

const generateOptions = options => {
  const results = []
  for (let i = 0, len = uas.length; i < len; i++) {
    const obj = { ua: uas[i], _match: [] }
    results.push(obj)
    for (let n = 0, len = options.length; n < len; n++) {
      const compare = createOptionObject(options[n])
      if (passTest(obj, compare)) {
        obj._match.push(n)
      }
    }
  }
  return results
}

const createOptionObject = (option, obj = { _match: [] }) => {
  for (let i = 0, len = option.length; i < len; i++) {
    const val = lookUp[option[i]]
    const op = val.operator
    if (op === '===') {
      obj[val.variable] = val.val
    } else if (op === '!==') {
      obj[val.variable] = '!|' + val.val
    } else if (op === '<' || op === '<=' || op === '>=' || op === '>') {
      obj[val.variable] = op + '|' + val.val
    }
  }
  return obj
}

const cleanup = options => {
  for (let i = 0, len = options.length; i < len; i++) {
    const option = options[i]
    for (let j = 0, len = option.length; j < len; j++) {
      const val = lookUp[option[j]]
      if (!val) continue

      for (let n = j + 1; n < len; n++) {
        const val2 = lookUp[option[n]]
        if (!val2) continue

        if (val2.variable === val.variable) {
          if (
            (val.operator === '>=' || val.operator === '>') &&
            (val2.operator === '>' || val2.operator === '>=')
          ) {
            if (val.val < val2.val) {
              option.splice(j, 1)
              j--
              n--
              len--
            } else {
              option.splice(n, 1)
              j--
              n--
              len--
            }
          } else if (
            (val.operator === '<=' || val.operator === '<') &&
            (val2.operator === '<' || val2.operator === '<=')
          ) {
            if (val.val > val2.val) {
              option.splice(j, 1)
              j--
              n--
              len--
            } else {
              option.splice(n, 1)
              j--
              n--
              len--
            }
          } else if (val.operator === '!==' && val2.operator === '===') {
            option.splice(j, 1)
            j--
            n--
            len--
          } else if (val.operator === '===' && val2.operator === '!==') {
            option.splice(n, 1)
            j--
            n--
            len--
          }
        }
      }
    }
  }

  // better ot just od this walk and not use splice just shift (speed)
  // remove duplicates
  for (let i = 0, len = options.length; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (options[i] && options[j] && isEqual(options[i], options[j])) {
        options.splice(j, 1)
        j--
        i--
        len--
      }
    }
  }

  return options
}

const isEqual = (a, b) => {
  const len = a.length
  if (len !== b.length) return false
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

module.exports = ua => {
  const total = []
  for (var key in ua) {
    if (key !== 'hash') {
      const result = parseua(ua[key])
      if (result.test.length) result.test.forEach(val => total.push(val))
      if (result.inversed) result.inversed.forEach(val => total.push(val))
    }
  }
  if (!total.length) return
  const clean = cleanup(total)
  console.log(clean)
  const results = generateOptions(clean)
  return finalResults(results, clean)
}
