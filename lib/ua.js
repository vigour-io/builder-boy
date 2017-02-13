var cnt = 0 //eslint-disable-line
const uids = {}
const lookUp = {}
// const hash = require('string-hash')
// const list = require('vigour-ua/test/common/useragents/list')
// const ua = require('vigour-ua')
// const uas = []

// for (var i in list) {
//   list[i].forEach(val => {
//     uas.push(ua(val))
//   })
// }

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
    // uids[parsed] = uid(cnt++)
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
      // NESTED IFS
      // needs to be parsed as well
      // const nest = parseua(ua[key]).test
      // const copy = []
      // // // now the cleanup ofcourse -- negation is hard
      // result.test = final || test
      // // // do negation later for this one
      // nest.forEach(n => test.forEach(t => copy.push(t.concat(n))))
      // final = test.concat(copy)
    }
  }
  result.test = final || test
  return result
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

  const clean = cleanup(total)

  for (var i in clean) {
    console.log(i, clean[i])
    console.log('------------------------------------------------')
  }

  const results = generateOptions(clean)

  // console.log(results)
}

const passTest = (obj, compare) => {
  let colished
  for (let i in obj) {
    if (compare[i]) {
      // console.log(i, compare[i])
      if (obj[i] !== compare[i]) {
        if (compare[i][0] === '<=' && compare[i].slice(1) * 1 <= obj[i]) {
        } else if (compare[i][0] === '>=' && compare[i].slice(1) * 1 >= obj[i]) {
        } else if (compare[i][0] === '>' && compare[i].slice(1) * 1 > obj[i]) {
        } else if (compare[i][0] === '<' && compare[i].slice(1) * 1 < obj[i]) {
        } else if (obj[i][0] === '!') {
        } else if (compare[i][0] === '!') {
        } else {
          colished = true
        }
      }
    }
  }
  if (!colished) {
    return true
  }
}

const generateOptions = options => {
  const results = []
  for (let i = 0, len = options.length; i < len; i++) {
    const option = options[i]
    const obj = createOptionObject(option)
    obj._match.push(i)
    results.push(obj)
    for (let n = 0; n < len; n++) {
      if (n !== i) {
        const compare = createOptionObject(options[n])
        if (passTest(obj, compare)) {
          console.log('MATCH!', obj, 'vs', compare)
        }
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
      obj[val.variable] = '!' + val.val
    } else if (op === '<' || op === '<=' || op === '>=' || op === '>') {
      obj[val.variable] = op + val.val
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

  // remove duplicates
  for (let i = 0, len = options.length; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (isEqual(options[i], options[j])) {
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
