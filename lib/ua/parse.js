'use strict'

/*
  Here we get conditions in format of:
  (a && b (c || d) && g && (h || j))

  And convert them into objects in format of:
  { $bin: true|false, $or: [[{ }, { }]], var: { operator: { value } } }

  $bin is true or false when the whole condition resolves to a binary
  $or is an array of array of objects, which are other conditions
  it is not a single array but array of arrays
  because every condition can have multiple or blocks in it
*/

// We only support following operators
const isOperator = x => x === '===' ||
  x === '>' ||
  x === '<' ||
  x === '==' ||
  x === '!=' ||
  x === '!==' ||
  x === '>=' ||
  x === '<='

// $in and $nin are our additions
const invertOperator = operator =>
  operator === '===' ? '!=='
    : operator === '!==' ? '==='
    : operator === '>' ? '<='
    : operator === '<' ? '>='
    : operator === '>=' ? '<'
    : operator === '<=' ? '>'
    : operator === '==' ? '!='
    : operator === '!=' ? '=='
    : operator === '$in' ? '$nin'
    : operator === '$nin' ? '$in'
    : undefined

// A single false kills whole and block
const andKill = and => {
  for (var key in and) {
    delete and[key]
  }

  and.$bin = false
}

// Fast way of keeping objects sorted
const sortAnd = and => {
  const keys = Object.keys(and).sort()
  var i = keys.length
  while (i--) {
    var swap = and[keys[i]]
    delete and[keys[i]]
    and[keys[i]] = swap
  }
}

// We do most of logical check in this function
// It's adding a new operator and value to an existing var
// a === 'something' && a !== 'other thing' becomes a === 'something'
const andPatch = (and, operator, val) => {
  // We make $in's and $nin's from equality tests
  // Because it makes further checks easier
  if (operator === '==' || operator === '===') {
    // $in is a sneaky shorthand of $or
    // a: $in: [1, 2] means $or:[[a === 1, a === 2], ...]
    operator = '$in'
    val = [String(val)]
  } else if (operator === '!=' || operator === '!==') {
    operator = '$nin'
    val = [String(val)]
  } else if (operator === '$in' || operator === '$nin') {
    val = val.slice()
    val.sort()
  }

  if (operator === '$in' && and.$nin) {
    // if you have $in first, $nin can only filter out
    let i = and['$nin'].length
    while (i--) {
      var found = val.indexOf(and['$nin'][i])
      if (~found) {
        val.splice(found, 1)
      }
    }
    delete and['$nin']
    if (val.length) {
      and[operator] = val
    } else {
      // condition is always false
      return -9
    }
  } else if (operator === '$nin' && and.$in) {
    // if you have $nin first, $in will be filtered out
    let i = and.$in.length
    while (i--) {
      if (~val.indexOf(and.$in[i])) {
        and['$in'].splice(i, 1)
      }
    }
    if (!and['$in'].length) {
      // condition is always false
      return -9
    }
  } else if (operator === '$in' && and.$in) {
    // if you have double $ins get intersection
    let i = and.$in.length
    while (i--) {
      if (!~val.indexOf(and.$in[i])) {
        and.$in.splice(i, 1)
      }
    }
    if (!and.$in.length) {
      // condition is always false
      return -9
    }
  } else if (operator === '$nin' && and.$nin) {
    // Merge $nin's unique
    let i = val.length
    while (i--) {
      if (!~and['$nin'].indexOf(val[i])) {
        and['$nin'].push(val[i])
      }
    }
    and['$nin'].sort()
  } else if ((operator === '>=' || operator === '>') && (and['<'] || and['<='])) {
    // check if it makes a range
    if (+(and['<'] || and['<=']) > val) {
      and[operator] = String(val)
    } else if (operator === '>=' && and['<='] && String(val) === and['<=']) {
      delete and['<=']
      and['$in'] = String(val)
    } else {
      // condition is always false
      return -9
    }
  } else if ((operator === '<=' || operator === '<') && (and['>'] || and['>='])) {
    // check it it makes a range
    if (val > +(and['>'] || and['>='])) {
      and[operator] = String(val)
    } else if (operator === '<=' && and['>='] && String(val) === and['>=']) {
      delete and['>=']
      and['$in'] = String(val)
    } else {
      // condition is always false
      return -9
    }
  } else if ((operator === '>=' || operator === '>') && (and['>'] || and['>='])) {
    if (val > +(and['>'] || and['>='])) {
      delete and['>']
      delete and['>=']
      and[operator] = val
    } else if (operator === '>' && String(val) === (and['>'] || and['>='])) {
      delete and['>=']
      and[operator] = val
    } else {
      // do not add
    }
  } else if ((operator === '<=' || operator === '<') && (and['<'] || and['<='])) {
    if (+(and['<'] || and['<=']) > val) {
      delete and['<']
      delete and['<=']
      and[operator] = val
    } else if (operator === '<' && String(val) === (and['<'] || and['<='])) {
      delete and['<=']
      and[operator] = val
    } else {
      // do not add
    }
  } else if ((operator === '>' || operator === '>=' || operator === '<' || operator === '<=') && and['$in']) {
    let i = and['$in'].length
    while (i--) {
      if ((operator === '>' && val >= +and['$in'][i]) || (operator === '>=' && val > +and['$in'][i]) || (operator === '<' && val <= +and['$in'][i]) || (operator === '<=' && val < +and['$in'][i])) {
        and['$in'].splice(i, 1)
      }
    }
    if (and['$in'].length) {
      // do not add
    } else {
      // condition is always false
      return -9
    }
  } else if (operator === '$in' && (and['>'] || and['>='] || and['<'] || and['<='])) {
    let i = val.length
    while (i--) {
      if ((and['>'] && +and['>'] >= val[i]) || (and['>='] && +and['>='] > val[i]) || (and['<'] && +and['<'] <= val[i]) || (and['<='] && +and['<='] < val[i])) {
        val.splice(i, 1)
      }
    }
    if (val.length) {
      delete and['>']
      delete and['>=']
      delete and['<']
      delete and['<=']
      and[operator] = val
    } else {
      // condition is always false
      return -9
    }
  } else if ((operator === '>' || operator === '>=' || operator === '<' || operator === '<=') && and['$nin']) {
    let i = and['$nin'].length
    while (i--) {
      if ((operator === '>' && val <= +and['$nin'][i]) || (operator === '>=' && val < +and['$nin'][i]) || (operator === '<' && val >= +and['$nin'][i]) || (operator === '<=' && val > +and['$nin'][i])) {
        and['$nin'].splice(i, 1)
      }
    }
    if (!and['$nin'].length) {
      delete and['$nin']
    }
    and[operator] = String(val)
  } else if (operator === '$nin' && (and['>'] || and['>='] || and['<'] || and['<='])) {
    let i = val.length
    while (i--) {
      if ((and['>'] && +and['>'] <= val[i]) || (and['>='] && +and['>='] < val[i]) || (and['<'] && +and['<'] >= val[i]) || (and['<='] && +and['<='] > val[i])) {
        val.splice(i, 1)
      }
    }
    if (val.length) {
      and[operator] = val
    } else {
      // do not add
    }
  } else if (operator === '<=' || operator === '<' || operator === '>=' || operator === '>') {
    and[operator] = String(val)
  } else {
    and[operator] = val
  }
}

// Some impossible combinations to avoid
const impossible = [
  { browser: { $in: ['ie', 'edge'] }, platform: { $in: ['android', 'ios'] } },
  { browser: { $in: ['ie', 'edge'] }, prefix: { $in: ['moz'] } },

  { browser: { $in: ['chrome'] }, prefix: { $in: ['ms', 'moz'] } },

  { browser: { $in: ['safari'] }, prefix: { $in: ['ms', 'moz'] } },

  { browser: { $in: ['firefox'] }, prefix: { $in: ['ms', 'webkit'] } },

  { device: { $in: ['bot'] }, platform: { $in: ['android', 'ios'] } },
  { device: { $in: ['bot'] }, webview: { $in: ['ploy-native'] } },

  { prefix: { $in: ['moz'] }, webview: { $in: ['ploy-native'] } }
]

// Here we merge two objects together by mutating the first one
// { a: 'something' } && { b: 'other thing' } becomes { a: 'something', b: 'other thing' }
const andMerge = (andTo, andFrom, doSimplify = true) => {
  if (andTo.hasOwnProperty('$bin') && !andTo.$bin) {
    return
  } else if (andFrom.hasOwnProperty('$bin') && !andFrom.$bin) {
    andKill(andTo)
    return
  } else if (andFrom.$bin && (andTo.$bin || !Object.keys(andTo).length)) {
    andTo.$bin = true
    return
  } else if (andTo.$bin && !Object.keys(andFrom).length) {
    delete andTo.$bin
  }

  if (andFrom.$or && andFrom.$or.length) {
    if (andTo.$or) {
      let i = andFrom.$or.length
      while (i--) {
        var found = false
        let j = andTo.$or.length
        while (j--) {
          if (JSON.stringify(andFrom.$or[i]) === JSON.stringify(andTo.$or[j])) {
            found = true
            break
          }
        }
        if (!found) {
          andTo.$or.push(andFrom.$or[i].slice())
        }
      }

      andTo.$or.sort((a, b) => JSON.stringify(a) > JSON.stringify(b))
    } else {
      andTo.$or = andFrom.$or.slice()
    }
  }

  for (let key in andFrom) {
    if (key !== '$or' && key !== '$bin') {
      // This part is removal of impossible combinations
      if (!andFrom[key].$nin) {
        let i = impossible.length
        while (i--) {
          let keys = Object.keys(impossible[i])
          let found = keys.indexOf(key)
          if (~found) {
            let and = {}
            for (let operator in andFrom[key]) {
              andPatch(and, operator, andFrom[key][operator])
            }
            let operator = Object.keys(impossible[i][key])[0]
            let res
            if (operator === '<' && (and['>'] || and['>='] || and['<'] || and['<='])) {
              res = (and['>'] || and['>='] || and['<'] || and['<=']) < impossible[i][key][operator] ? -9 : null
            } else {
              res = andPatch(and, invertOperator(operator), impossible[i][key][operator])
            }
            if (res === -9) {
              let key2 = keys[(found + 1) % 2]
              if (andTo[key2] && !andTo[key2].$nin) {
                let operator = Object.keys(impossible[i][key2])[0]
                let res
                if (operator === '<' && (andTo[key2]['>'] || andTo[key2]['>='] || andTo[key2]['<'] || andTo[key2]['<='])) {
                  res = (andTo[key2]['>'] || andTo[key2]['>='] || andTo[key2]['<'] || andTo[key2]['<=']) < impossible[i][key2][operator] ? -9 : null
                } else {
                  res = andPatch(andTo[key2], invertOperator(operator), impossible[i][key2][operator])
                }
                if (res === -9) {
                  andKill(andTo)
                  return
                }
              }
            }
          }
        }
      }

      if (!andTo[key]) {
        andTo[key] = {}
      }

      for (let operator in andFrom[key]) {
        var res = andPatch(andTo[key], operator, andFrom[key][operator])
        if (res === -9) {
          andKill(andTo)
          return
        }
      }
    }
  }

  if (doSimplify) {
    simplify(andTo)
  }
  sortAnd(andTo)
}

// Takes a single or array
// and returns a test object
const orPatch = (or) => {
  const and = {}
  var inverted

  // (a || b) === !(!a && !b)
  var i = or.length
  while (i--) {
    inverted = {}
    invert(or[i], inverted)
    andMerge(and, inverted)
  }

  inverted = {}
  invert(and, inverted)

  return inverted
}

// Takes a test and an empty object
// Mutates the empty object to the negation of test
const invert = (test, inverted) => {
  var or = []

  if (test.hasOwnProperty('$bin')) {
    inverted.$bin = !test.$bin
    return
  }

  if (test.$or) {
    var i = test.$or.length
    while (i--) {
      let andOfOr = {}
      var j = test.$or[i].length
      while (j--) {
        var and = {}
        invert(test.$or[i][j], and)
        andMerge(andOfOr, and)
      }
      or.push(andOfOr)
    }
  }

  for (var key in test) {
    if (key !== '$or' && key !== '$bin') {
      for (var operator in test[key]) {
        let and = {}
        andPatch(and, invertOperator(operator), test[key][operator])
        or.push({ [key]: and })
      }
    }
  }

  var gotFalse = false

  if (or.length > 1) {
    let i = or.length
    while (i--) {
      if (or[i].hasOwnProperty('$bin')) {
        if (or[i].$bin) {
          inverted.$bin = true
          return
        } else {
          gotFalse = true
          or.splice(i, 1)
        }
      }
    }
  }

  if (or.length > 1) {
    or.sort((a, b) => JSON.stringify(a) > JSON.stringify(b))
    inverted.$or = [or]
  } else if (or.length) {
    andMerge(inverted, or[0])
  } else if (gotFalse) {
    inverted.$bin = false
  }
}

const orClean = (test, i, gotFalse) => {
  if (!test.$or[i].length) {
    if (gotFalse) {
      return andKill(test)
    } else {
      test.$or.splice(i, 1)
    }
  } else if (test.$or[i].length === 1) {
    andMerge(test, test.$or.splice(i, 1)[0][0], false)
  } else {
    return true
  }

  if (test.$or && !test.$or.length) {
    delete test.$or
  }
}

// Takes a test and mutates it to simplify
const simplify = test => {
  if (test.$or) {
    const andPart = JSON.parse(JSON.stringify(test))
    delete andPart.$or
    let i = test.$or.length
    while (i--) {
      if (!test.$or) {
        return
      } else if (!test.$or[i]) {
        continue
      }
      let keys = {}
      let out = []
      let all = []

      let j = test.$or[i].length
      while (j--) {
        const orClone = JSON.parse(JSON.stringify(test.$or[i][j]))
        andMerge(orClone, andPart, false)
        if (orClone.$bin === false) {
          test.$or[i].splice(j, 1)
          if (orClean(test, i, true) !== true) {
            return simplify(test)
          }
        } else if (JSON.stringify(orClone) === JSON.stringify(andPart)) {
          test.$or[i] = []
          orClean(test, i)
          return simplify(test)
        }
      }

      j = test.$or[i].length
      while (j--) {
        for (let key in test.$or[i][j]) {
          if (!keys[key]) {
            keys[key] = { $t: test.$or[i].length - 1 }
          } else if (!--keys[key].$t) {
            all.push(key)
          }
          let comp = JSON.stringify(test.$or[i][j][key])
          if (!keys[key][comp]) {
            keys[key][comp] = test.$or[i].length - 1
          } else if (!--keys[key][comp]) {
            out.push({ key, comp: test.$or[i][j][key] })
            all.splice(all.indexOf(key), 1)
            delete keys[key]
          }
        }
      }

      j = out.length
      while (j--) {
        if (!test[out[j].key]) {
          test[out[j].key] = {}
        }
        for (let operator in out[j].comp) {
          let res = andPatch(test[out[j].key], operator, out[j].comp[operator])
          if (res === -9) {
            andKill(test)
            return
          }
        }
        let k = test.$or[i].length
        while (k--) {
          delete test.$or[i][k][out[j].key]
          if (!Object.keys(test.$or[i][k]).length) {
            test.$or[i].splice(k, 1)
            if (orClean(test, i) !== true) {
              return simplify(test)
            }
          }
        }
      }

      if (all.length === 1 && Object.keys(keys).length === 1) {
        let andOfOr = orPatch(test.$or.splice(i, 1)[0])
        andMerge(test, andOfOr, false)
        if (test.$or && !test.$or.length) {
          delete test.$or
        } else {
          return simplify(test)
        }
      }
    }
  }
}

const parseAnd = (test, resolved, left) => {
  for (var key in test) {
    if (isOperator(key)) {
      if (!resolved[left]) {
        resolved[left] = {}
      }
      var res = andPatch(resolved[left], key, test[key])
      if (res === -9) {
        andKill(resolved[left])
        return
      }
    } else {
      parseTest(test[key], resolved, key)
    }
  }
}

const parseTest = (test, resolved, left) => {
  var i = test.length

  if (i > 1) {
    var or = []
    while (i--) {
      const and = {}
      parseAnd(test[i], and, left)
      or.push(and)
    }

    const andOfOr = orPatch(or)
    andMerge(resolved, andOfOr)
  } else {
    parseAnd(test[0], resolved, left)
    simplify(resolved)
    sortAnd(resolved)
  }
}

const parseUA = (ua, list = [], preCondition, passDown) => {
  if (ua.test) {
    var test

    if (Array.isArray(preCondition)) {
      test = preCondition[0]
      preCondition = preCondition[1]
    } else {
      test = {}
      parseTest(ua.test, test)

      const inverted = {}
      invert(test, inverted)

      if (!Object.keys(preCondition).length && list.length) {
        var found = false
        var i = list.length
        while (i--) {
          var check = JSON.parse(JSON.stringify(test))
          andMerge(check, list[i])

          var checkInverted = JSON.parse(JSON.stringify(inverted))
          andMerge(checkInverted, list[i])

          if (check.$bin !== false || checkInverted.$bin !== false) {
            list.splice(i, 1)
            parseUA(ua, list, [check, checkInverted])

            if (checkInverted.$bin !== false) {
              found = true
            }
          }
        }

        if (!found) {
          list.push(inverted)
        }

        return
      }

      andMerge(test, preCondition)
      andMerge(preCondition, inverted)
    }

    if (test.$bin !== false) {
      const conditional = Object.keys(ua).filter(k => k !== 'test' && k !== 'alternate')

      if (conditional.length) {
        parseUA(ua[conditional[0]], list, test)
      } else {
        list.push(test)
      }
    }

    if (preCondition.$bin !== false) {
      if (ua.alternate && Object.keys(ua.alternate).length) {
        parseUA(ua.alternate, list, preCondition, true)
      } else {
        list.push(preCondition)
      }
    }
  } else {
    for (var k in ua) {
      parseUA(ua[k], list, passDown ? preCondition : {})
    }
  }
}

// Takes a finalized test to remove all or's recursively
// Tries picking least restrictive test object from each array of or
const removeOrs = test => {
  let i = test.$or.length
  while (i--) {
    if (!test.$or[i]) {
      continue
    }
    let j = test.$or[i].length
    while (j--) {
      if (test.$or[i][j].$or) {
        removeOrs(test.$or[i][j])
        if (test.$or[i][j].hasOwnProperty('$bin') && !test.$or[i][j].$bin) {
          test.$or[i].splice(j, 1)
        }
      }
    }
    if (!test.$or[i].length) {
      andKill(test)
      return
    }
    test.$or[i].sort((me, other) => {
      var pickMe = 0
      for (let key in me) {
        let myOps = Object.keys(me[key])
        let myOp = myOps[0]
        if (other[key]) {
          let otherOps = Object.keys(other[key])
          let otherOp = otherOps[0]
          if (myOp === '$in' && otherOp === '$in') {
            if (me[key].$in.length > other[key].$in.length) {
              pickMe++
            } else {
              pickMe--
            }
          } else if (myOp === '$nin' && otherOp === '$nin') {
            if (me[key].$nin.length > other[key].$nin.length) {
              pickMe--
            } else {
              pickMe++
            }
          } else if ((myOp !== '$in' && otherOp === '$in') || (myOp === '$nin' && otherOp !== '$nin')) {
            pickMe += 10
          } else if ((myOp === '$in' && otherOp !== '$in') || (myOp !== '$nin' && otherOp === '$nin')) {
            pickMe -= 10
          } else if (myOps.length > otherOps.length) {
            pickMe--
          } else if (otherOps.length > myOps.length) {
            pickMe++
          }
        } else {
          pickMe -= myOp === '$in' ? 25
            : myOp === '$nin' ? 10
            : myOps.length > 1 ? 20
            : 15
        }
      }
      for (let key in other) {
        let otherOps = Object.keys(other[key])
        let otherOp = otherOps[0]
        if (!me[key]) {
          pickMe += otherOp === '$in' ? 25
            : otherOp === '$nin' ? 10
            : otherOps.length > 1 ? 20
            : 15
        }
      }
      return pickMe < 0
    })

    andMerge(test, test.$or.splice(i, 1)[0][0])
    if (!test.$or) {
      return
    }
  }
  delete test.$or
}

// Takes a test object and returns a fake user agent
const generateFakeUA = condition => {
  const ua = {}
  const keys = ['webview', 'device', 'platform', 'prefix', 'version', 'browser']
  let i = keys.length

  while (i--) {
    let source = condition[keys[i]] || {}
    let min = source['>'] || source['>='] || -Infinity
    let max = source['<'] || source['<='] || Infinity

    ua[keys[i]] = source.$in ? source.$in[0]
      : source.$nin ? `not-${source.$nin.join('-')}`
      : min !== -Infinity && max !== Infinity ? (+min + +max) / 2
      : min !== -Infinity ? +min + 1
      : max !== Infinity ? +max - 1
      : 'any'
  }

  return ua
}

module.exports = ua => {
  var start = +new Date()

  var list = []
  parseUA(ua, list, {})

  var i = list.length
  while (i--) {
    simplify(list[i])

    if (list[i].$or) {
      removeOrs(list[i])
    }

    if (list[i].hasOwnProperty('$bin')) {
      list.splice(i, 1)
      continue
    }

    list[i] = {
      condition: list[i],
      ua: JSON.stringify(generateFakeUA(list[i]))
    }
  }

  i = list.length
  while (i--) {
    let j = i
    while (j--) {
      if (list[i].ua === list[j].ua) {
        list.splice(j, 1)
        i--
      }
    }
  }

  console.log('creating %d builds took %d ms', list.length, +new Date() - start)
  return list
}
