'use strict'

const ua = require('vigour-ua')

const lookUp = {}

const isOperator = x => x === '===' ||
  x === '>' ||
  x === '<' ||
  x === '==' ||
  x === '!=' ||
  x === '!==' ||
  x === '>=' ||
  x === '<='

const invertOperator = operator =>
  operator === '===' ? '!=='
  : operator === '!==' ? '==='
  : operator === '>' ? '<='
  : operator === '<' ? '>='
  : operator === '>=' ? '<'
  : operator === '<=' ? '>'
  : operator === '==' ? '!='
  : operator === '!=' ? '=='
  : undefined

const toComparison = (operator, variable, val) => {
  const comparison = variable + operator + val
  if (!lookUp[comparison]) {
    lookUp[comparison] = { variable, operator, val }
  }
  return comparison
}

const invertComparison = comparison => {
  const { operator, variable, val } = lookUp[comparison]
  return toComparison(invertOperator(operator), variable, val)
}

const invert = test => {
  if (test) {
    const results = []
    var a

    var i = test.length
    while (i--) {
      var j = test[i].length
      a = []
      while (j--) {
        a.unshift(invertComparison(test[i][j]))
      }
      results.unshift(a)
    }

    return results
  }
}

// --------------- needs to be fixed not complete! -----------------
// misses [ (a || b) && c]
// probably nice to make this part of builder boy
// rest goes away
const preParse = (val, variable) => {
  const branches = []
  val.forEach(t => {
    const results = {}
    for (let key in t) {
      if (isOperator(key)) {
        results.val = toComparison(key, variable, t[key])
      } else {
        const keyBranches = preParse(t[key], key)
        for (let i in keyBranches) {
          results[key + '-' + i] = keyBranches[i]
        }
      }
    }
    branches.push(results)
  })
  return branches
}

const parse = (val, results, arr) => {
  const prev = 0
  for (var i in val) {
    if (i === 'val') {
      if (!arr) {
        arr = [ val.val ]
        results.push(arr)
      } else {
        arr.push(val.val)
      }
    } else {
      const nr = i.split('-')[1]
      if (Number(nr) === prev) {
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
    const result = parseua(ua[key])
    if (result.test.length) result.test.forEach(val => total.push(val))
    if (result.inversed) result.inversed.forEach(val => total.push(val))
  }
  if (!total.length) return
  const clean = cleanup(total)
  console.log('   -', clean.join('\n   - '))
  const results = generateOptions(clean)
  return finalResults(results, clean)
}
