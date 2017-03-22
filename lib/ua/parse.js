'use strict'

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
    : operator === '$nin' ? '$in'
    : operator === '$in' ? '$nin'
    : undefined

const andKill = and => {
  for (var key in and) {
    delete and[key]
  }

  and.$bin = false
}

const andPatch = (and, operator, val) => {
  if (operator === '==' || operator === '===') {
    operator = '$in'
    val = [String(val)]
  } else if (operator === '!=' || operator === '!==') {
    operator = '$nin'
    val = [String(val)]
  } else if (operator === '$in' || operator === '$nin') {
    val = val.slice()
  }

  if (operator === '$in' && and.$nin) {
    // if you have $in first, $nin can only filter out
    var i = and['$nin'].length
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
    let i = val.length
    while (i--) {
      let found = and['$in'].indexOf(val[i])
      if (~found) {
        and['$in'].splice(found, 1)
      }
    }
    if (!and['$in'].length) {
      // condition is always false
      return -9
    }
  } else if (operator === '$in' && and.$in) {
    // if you have double $ins trash non equals
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
    // if you have already merged non equals, add to that
    let i = val.length
    while (i--) {
      if (!~and['$nin'].indexOf(val[i])) {
        and['$nin'].push(val[i])
      }
    }
  } else if ((operator === '>=' || operator === '>') && (and['<'] || and['<='])) {
    // check it it makes a range
    if ((and['<'] || and['<=']) > val) {
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
    if (val > (and['>'] || and['>='])) {
      and[operator] = String(val)
    } else if (operator === '<=' && and['>='] && String(val) === and['>=']) {
      delete and['>=']
      and['$in'] = String(val)
    } else {
      // condition is always false
      return -9
    }
  } else if ((operator === '>=' || operator === '>') && (and['>'] || and['>='])) {
    if (val > (and['>'] || and['>='])) {
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
    if ((and['<'] || and['<=']) > val) {
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
      if ((operator === '>' && val >= and['$in'][i]) || (operator === '>=' && val > and['$in'][i]) || (operator === '<' && val <= and['$in'][i]) || (operator === '<=' && val < and['$in'][i])) {
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
      if ((and['>'] && and['>'] >= val[i]) || (and['>='] && and['>='] > val[i]) || (and['<'] && and['<'] <= val[i]) || (and['<='] && and['<='] < val[i])) {
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
      if ((operator === '>' && val <= and['$nin'][i]) || (operator === '>=' && val < and['$nin'][i]) || (operator === '<' && val >= and['$nin'][i]) || (operator === '<=' && val > and['$nin'][i])) {
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
      if ((and['>'] && and['>'] <= val[i]) || (and['>='] && and['>='] < val[i]) || (and['<'] && and['<'] >= val[i]) || (and['<='] && and['<='] > val[i])) {
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

const orPatch = (or) => {
  const and = {}
  var inverted

  // (a || b) === !(!a && !b)
  var i = or.length
  while (i--) {
    inverted = {}
    invert(or[i], inverted)
    andPatchTo(and, inverted)
  }

  inverted = {}
  invert(and, inverted)

  return inverted
}

const andPatchTo = (andTo, andFrom, noEliminate) => {
  if (andFrom.hasOwnProperty('$bin')) {
    if (!andFrom.$bin) {
      andKill(andTo)
      return
    } else if (andFrom.$bin && !Object.keys(andTo).length) {
      andTo.$bin = true
      return
    }
  }

  if (andFrom.$or && andFrom.$or.length) {
    if (andTo.$or) {
      var i = andFrom.$or.length
      while (i--) {
        var found = false
        var j = andTo.$or.length
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

  for (var key in andFrom) {
    if (key !== '$or' && key !== '$bin') {
      if (!andTo[key]) {
        andTo[key] = {}
      }

      for (var operator in andFrom[key]) {
        var res = andPatch(andTo[key], operator, andFrom[key][operator])
        if (res === -9) {
          andKill(andTo)
          return
        }
      }
    }
  }

  if (!noEliminate) {
    eliminate(andTo)
  }
  sortAnd(andTo)
}

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
        andPatchTo(andOfOr, and)
      }
      or.push(andOfOr)
    }
  }

  for (var key in test) {
    if (key !== '$or' && key !== '$bin') {
      const and = {}
      for (var operator in test[key]) {
        var res = andPatch(and, invertOperator(operator), test[key][operator])
        if (res === -9) {
          andKill(and)
          break
        }
      }
      or.push({ [key]: and })
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
    andPatchTo(inverted, or[0])
  } else if (gotFalse) {
    inverted.$bin = false
  }
}

const eliminate = test => {
  if (test.$or) {
    for (var key in test) {
      if (key !== '$or') {
        var i = test.$or.length
        while (i--) {
          var before = 0
          var after = 0
          var newOr = []
          var j = test.$or[i].length
          while (j--) {
            var and = {}
            before += Object.keys(test.$or[i][j]).length
            andPatchTo(and, test.$or[i][j])
            for (var operator in test[key]) {
              if (!and[key]) {
                and[key] = {}
              }
              var res = andPatch(and[key], operator, test[key][operator])
              if (res === -9) {
                andKill(and)
                before = Infinity
              } else {
                after += Object.keys(and).length
              }
            }
            newOr.push(and)
          }

          if (before >= after) {
            /*
            console.log('----- eliminating -----')
            console.log('test: %j', test)
            console.log('key: %s test: %j', key, test[key])
            console.log('before: %d > after: %d', before, after)
            console.log('before: %j', test.$or[i])
            console.log('after: %j', newOr)
            */

            delete test[key]

            var gotFalse = false

            var k = newOr.length
            while (k--) {
              if (newOr[k].hasOwnProperty('$bin')) {
                if (!newOr[k].$bin) {
                  gotFalse = true
                  newOr.splice(k, 1)
                }
              }
            }

            if (newOr.length > 1) {
              newOr.sort((a, b) => JSON.stringify(a) > JSON.stringify(b))
              test.$or[i] = newOr
            } else if (newOr.length) {
              test.$or.splice(i, 1)
              andPatchTo(test, newOr[0], true)
              if (!test.$or) {
                return
              }
            } else if (gotFalse) {
              andKill(test)
              return
            }
          }
        }
      }
    }
  }
}

const sortAnd = and => {
  const keys = Object.keys(and).sort()
  var i = keys.length
  while (i--) {
    var swap = and[keys[i]]
    delete and[keys[i]]
    and[keys[i]] = swap
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
    andPatchTo(resolved, andOfOr)
  } else {
    parseAnd(test[0], resolved, left)
    eliminate(resolved)
    sortAnd(resolved)
  }
}

const parseUA = (ua, list = [], preCondition, passDown) => {
  if (ua.test) {
    const test = {}
    parseTest(ua.test, test)

    const inverted = {}
    invert(test, inverted)

    if (!Object.keys(preCondition).length) {
      var found = false
      var i = list.length
      while (i--) {
        var check = {}
        andPatchTo(check, test)
        andPatchTo(check, list[i])
        if (check.$bin !== false) {
          found = true
          preCondition = list.splice(i, 1)[0]
          parseUA(ua, list, preCondition)
        }
      }
      if (found) {
        return
      }
    }

    andPatchTo(test, preCondition)

    const conditional = Object.keys(ua).filter(k => k !== 'test' && k !== 'alternate')

    if (conditional.length) {
      parseUA(ua[conditional[0]], list, test)
    } else if (test.$bin !== false) {
      list.push(test)
    }

    andPatchTo(preCondition, inverted)

    if (preCondition.$bin === false) {
      return
    }

    if (ua.alternate && Object.keys(ua.alternate).length) {
      parseUA(ua.alternate, list, preCondition, true)
    } else {
      list.push(preCondition)
    }
  } else {
    for (var k in ua) {
      parseUA(ua[k], list, passDown ? preCondition : {})
    }
  }
}

const removeOrs = test => {
  var i = test.$or.length
  while (i--) {
    test.$or[i].sort((me, other) => {
      var pickMe = 0
      for (let key in me) {
        if (other[key]) {
          const myOp = Object.keys(me[key])[0]
          const otherOp = Object.keys(other[key])[0]
          if (myOp === '$in' && otherOp === '$in') {
            if (me[key].$in.length > other[key].$in.length) {
              pickMe++
            } else {
              pickMe--
            }
          } else if ((myOp !== '$in' && otherOp === '$in') || (myOp === '$nin' && otherOp !== '$nin')) {
            pickMe += 10
          } else if ((myOp === '$in' && otherOp !== '$in') || (myOp !== '$nin' && otherOp === '$nin')) {
            pickMe -= 10
          }
        } else {
          pickMe -= 100
        }
      }
      for (let key in other) {
        if (!me[key]) {
          pickMe += 100
        }
      }
      return pickMe < 0
    })
    andPatchTo(test, test.$or[i][0])
    if (!test.$or) {
      return
    }
  }
  delete test.$or
}

const filterUA = (ua, key, filter) => {
  for (let operator in filter) {
    let val = filter[operator]

    if (operator === '$in') {
      let i = ua[key].nin.length
      while (i--) {
        var found = val.indexOf(ua[key].nin[i])
        if (~found) {
          val.splice(found, 1)
        }
      }
      ua[key].nin = []
      if (!val.length) {
        console.log('=======FOUND FALSE=======')
      }
      if (ua[key].in.length) {
        let i = ua[key].in.length
        while(i--) {
          if (~!val.indexOf(ua[key].in[i])) {
            ua[key].in.splice(i, 1)
          }
        }
      } else {
        ua[key].in = val
      }
    } else if (operator === '$nin') {
      if (!ua[key].in.length) {
        let i = val.length
        while (i--) {
          if (!~ua[key].nin.indexOf(val[i])) {
            ua[key].nin.push(val[i])
          }
        }
      } else {
        let i = val.length
        while (i--) {
          let found = ua[key].in.indexOf(val[i])
          if (~found) {
            ua[key].in.splice(found, 1)
          }
        }
        if (!ua[key].in.length) {
          console.log('=======FOUND FALSE=======')
        }
      }
    } else if (operator === '<=' || operator === '<') {
      if (ua[key].max > val) {
        ua[key].max = val
      }
    } else if (operator === '>=' || operator === '>') {
      if (ua[key].min < val) {
        ua[key].min = val
      }
    }
  }
}

const generateFakeUA = condition => {
  if (condition.hasOwnProperty('$bin')) {
    return condition.$bin
  }

  const ua = {
    browser: { in: [], nin: [], min: -Infinity, max: Infinity },
    version: { in: [], nin: [], min: -Infinity, max: Infinity },
    prefix: { in: [], nin: [], min: -Infinity, max: Infinity },
    platform: { in: [], nin: [], min: -Infinity, max: Infinity },
    device: { in: [], nin: [], min: -Infinity, max: Infinity },
    webview: { in: [], nin: [], min: -Infinity, max: Infinity }
  }

  for (var key in condition) {
    filterUA(ua, key, condition[key])
  }

  return ua
}

module.exports = ua => {
  var list = []
  parseUA(ua, list, {})

  var i = list.length
  while (i--) {
    if (list[i].$or) {
      removeOrs(list[i])
      if (list[i].hasOwnProperty('$bin')) {
        list.splice(i, 1)
      }
    }
  }

  list = list.map(condition => {
    const ua = generateFakeUA(condition)
    for (let key in ua) {
      ua[key] = ua[key].in.length ? ua[key].in[0]
        : ua[key].nin.length ? `not-${ua[key].nin.join('-')}`
        : ua[key].min !== -Infinity && ua[key].max !== Infinity ? (ua[key].min + ua[key].max) / 2
        : ua[key].min !== -Infinity ? +ua[key].min + 1
        : ua[key].max !== Infinity ? +ua[key].max - 1
        : 'any'
    }

    return { condition, ua: JSON.stringify(ua) }
  })

  i = list.length
  while (i--) {
    var j = i
    while (j-- > 0) {
      if (!list[i] || !list[j]) {
        // console.log(i, j)
      }
      if (list[i].ua === list[j].ua) {
        list.splice(j, 1)
        i--
      }
    }

  }

  return list
}
