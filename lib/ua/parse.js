'use strict'

const hash = require('string-hash')

const isOperator = x => x === '==='
  || x === '>'
  || x === '<'
  || x === '=='
  || x === '!='
  || x === '!=='
  || x === '>='
  || x === '<='

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
    val = [val]
  } else if (operator === '!=' || operator === '!==') {
    operator = '$nin'
    val = [val]
  }

  if (operator === '$in' && and['$nin']) {
    // if you have $in first, $nin can only filter out
    var i = and['$nin'].length
    while (i--) {
      let found = val.indexOf(and['$nin'][i])
      if (~found) {
        val.splice(found, 1)
      }
    }
    delete and['$nin']
    if (val.length) {
      and[ operator ] = val
    } else {
      // condition is always false
      return -9
    }
  } else if (operator === '$nin' && and['$in']) {
    // if you have $nin first, $in will be filtered out
    var i = val.length
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
  } else if (operator === '$in' && and['$in']) {
    // if you have double $ins trash all
    // unless equals to same value
    if (and['$in'].find(v => !~val.indexOf(v))) {
      // condition is always false
      return -9
    } else {
      // do not add
    }
  } else if (operator === '$nin' && and['$nin']) {
    // if you have already merged non equals, add to that
    var i = and['$nin'].length
    while(i--) {
      let found = val.indexOf(and['$nin'][i])
      if (~found) {
        val.splice(found, 1)
      }
    }
    and['$nin'] = and['$nin'].concat(val)
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
  while(i--) {
    inverted = {}
    invert(or[i], inverted)
    andPatchTo(and, inverted)
  }

  inverted = {}
  invert(and, inverted)

  return inverted
}

const andPatchTo = (andTo, andFrom) => {
  if (andFrom.hasOwnProperty('$bin') && !andFrom.$bin) {
    andKill(andTo)
    return
  }

  if (andFrom.$or) {
    if (andTo.$or) {
      var i = andFrom.$or.length
      var j = andTo.$or.length
      while (i--) {
        let found = false
        while (j--) {
          if (JSON.stringify(andFrom.$or[i]) === JSON.stringify(andTo.$or[j])) {
            found = true
          }
        }
        if (!found) {
          andTo.$or.push(andFrom.$or[i])
        }
      }

      andTo.$or.sort((a, b) => JSON.stringify(a) > JSON.stringify(b))
    } else {
      andTo.$or = andFrom.$or
    }
  }

  for (var key in andFrom) {
    if (key !== '$or' && key !== '$bin') {
      if (!andTo[key]) {
        andTo[key] = {}
      }

      for (var operator in andFrom[key]) {
        let res = andPatch(andTo[key], operator, andFrom[key][operator])
        if (res === -9) {
          andKill(andTo)
          return
        }
      }
    }
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
    let i = test.$or.length
    while(i--) {
      let andOfOr = {}
      let j = test.$or[i].length
      while (j--) {
        let and = {}
        invert(test.$or[i][j], and)
        andPatchTo(andOfOr, and)
      }
      or.push(andOfOr)
    }
  }

  for (var key in test) {
    if (key !== '$or' && key !== '$bin') {
      let and = {}
      for (var operator in test[key]) {
        let res = andPatch(and, invertOperator(operator), test[key][operator])
        if (res === - 9) {
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

const sortAnd = and => {
  const keys = Object.keys(and).sort()
  var i = keys.length
  while (i--) {
    let swap = and[keys[i]]
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
      let res = andPatch(resolved[left], key, test[key])
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
    if (andOfOr.$or) {
      if (!resolved.$or) {
        resolved.$or = []
      }
      resolved.$or.push(andOfOr.$or)
    } else {
      andPatchTo(resolved, andOfOr)
    }
  } else {
    parseAnd(test[0], resolved, left)
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
        let check = {}
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

const filterUA = (ua, key, filter) => {
  for (var operator in filter) {
    let val = filter[operator]

    if (operator === '$in' || operator === '===' || operator === '==') {
      ua[key].nin = []
      ua[key].in = [].concat(val)
    } else if (operator === '$nin' || operator === '!==' || operator === '!=') {
      if (!ua[key].in.length) {
        let list = [].concat(val)
        var i = list.length
        while (i--) {
          if (!~ua[key].nin.indexOf(list[i])) {
            ua[key].nin.push(list[i])
          }
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

const expandUA = (expanded, ua) => {
  for (var key in ua) {
    let uaIn = ua[key].in
    let uaNin = ua[key].nin
    let uaMax = ua[key].max
    let uaMin = ua[key].min

    if (uaIn.length) {
      if (!expanded[key] || !expanded[key].$nin) {
        if (!expanded[key]) {
          expanded[key] = {}
        }
        if (!expanded[key].$in) {
          expanded[key].$in = []
        }
        var i = uaIn.length
        while(i--) {
          if (!~expanded[key].$in.indexOf(uaIn[i])) {
            expanded[key].$in.push(uaIn[i])
          }
        }
      }
    }

    if (uaNin.length) {
      if (!expanded[key]) {
        expanded[key] = {}
      }
      delete expanded[key].$in
      if (!expanded[key].$nin) {
        expanded[key].$nin = []
      }
      var i = uaNin.length
      while(i--) {
        if (!~expanded[key].$nin.indexOf(uaNin[i])) {
          expanded[key].$nin.push(uaNin[i])
        }
      }
    }

    if (uaMax !== Infinity && (!expanded[key] || !expanded[key]['<'] || expanded[key]['<'] < uaMax)) {
      if (!expanded[key]) {
        expanded[key] = {}
      }
      expanded[key]['<'] = uaMax
    }

    if (uaMin !== -Infinity && (!expanded[key] || !expanded[key]['>'] || expanded[key]['>'] > uaMin)) {
      if (!expanded[key]) {
        expanded[key] = {}
      }
      expanded[key]['>'] = uaMin
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

  if (condition.$or) {
    const expanded = {}
    var i = condition.$or.length
    while(i--) {
      expandUA(expanded, generateFakeUA(condition.$or[i]))
    }
    for (var key in expanded) {
      filterUA(ua, key, expanded[key])
    }
  }

  for (var key in condition) {
    if (key !== '$or') {
      filterUA(ua, key, condition[key])
    }
  }

  return ua
}

module.exports = ua => {
  var list = []
  parseUA(ua, list, {})
  list = list.map(condition => {
    const ua = generateFakeUA(condition)
    for (var key in ua) {
      ua[key] = ua[key].in.length ? ua[key].in[0]
        // : ua[key].nin.length ? `not-${ua[key].nin.join('-')}`
        : ua[key].min !== -Infinity && ua[key].max !== Infinity ? (ua[key].min + ua[key].max)/2
        : ua[key].min !== -Infinity ? +ua[key].min + 1
        : ua[key].max !== Infinity ? +ua[key].max - 1
        : 'any'
    }

    return { condition, ua: JSON.stringify(ua) }
  })

  var i = list.length
  var j

  /*
  while(i--) {
    j = i
    while(j-- > 0) {
      if (!list[i] || !list[j]) {
        console.log(i, j)
      }
      if (list[i].ua === list[j].ua) {
        list.splice(j, 1)
        i--
      }
    }
  }
  */

  i = list.length
  while(i--) {
    console.log('%j', list[i].condition)
    console.log('---------------------')
  }

  return list
}
