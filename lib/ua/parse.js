'use strict'

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
  if (operator === '$in' && and['$nin']) {
    // if you have $in first, $nin can only filter out
    var i = and['$nin'].length
    while(i--) {
      let found = val.indexOf(and['$nin'][i])
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
  } else if (operator === '$in' && (and['!='] || and['!=='])) {
    // if you have $in first, non-equals can only filter out
    let found = val.indexOf((and['!='] || and['!==']))
    if (~found) {
      val.splice(found, 1)
    }
    delete and['!==']
    delete and['!=']
    if (val.length) {
      and[operator] = val
    } else {
      // condition is always false
      return -9
    }
  } else if ((operator === '===' || operator === '==') && (and['==='] || and['=='] || and['$in'])) {
    // if you have multiple equals, all goes trash
    // unless equals to same value
    if (val === (and['==='] || and['==']) || (and['$in'] && ~and['$in'].indexOf(val))) {
      // do not add
    } else {
      // condition is always false
      return -9
    }
  } else if (operator === '$in' && (and['==='] || and['=='])) {
    // if you have $in first, equals trash all
    // unless equals to same value
    if (~val.indexOf((and['=='] || and['===']))) {
      delete and['===']
      delete and['==']
      and[ operator ] = val
    } else {
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
  } else if ((operator === '===' || operator === '==') && (and['!=='] || and['!='] || and['$nin'])) {
    // if you have equals first, non-equals doesn't matters later
    if ((operator === '===' || operator === '==') === (and['!=='] || and['!=']) || (and['$nin'] && ~and['$nin'].indexOf(val))) {
      // condition is always false
      return -9
    } else {
      delete and['!==']
      delete and['!=']
      delete and['$nin']
      and[operator] = val
    }
  } else if ((operator === '$nin' || operator === '!==' || operator === '!=') && (and['==='] || and['=='])) {
    // if you have equals later, you can ignore previous non-equals
    // unless they are checking for same value
    if ((operator === '$nin' && ~val.indexOf((and['==='] || and['==']))) || (operator === '!==' || operator === '!=') === (and['==='] || and['=='])) {
      // condition is always false
      return -9
    } else {
      // do not add
    }
  } else if ((operator === '$nin' || operator === '!==' || operator === '!=') && (and['!=='] || and['!='])) {
    // if you have more than one non-equals, you need to merge
    if ((operator === '$nin' && !~val.indexOf(and['!=='] || and['!='])) || (operator === '!==' || operator === '!=') !== (and['!=='] || and['!='])) {
      and['$nin'] = [and['!=='] || and['!=']].concat(val)
    }
    delete and['!==']
    delete and['!=']
  } else if ((operator === '!==' || operator === '!=') && and['$nin']) {
    // if you have already merged non equals, add to that
    if (!~and['$nin'].indexOf(val)) {
      and['$nin'].push(val)
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
      and['==='] = String(val)
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
      and['==='] = String(val)
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
  } else if (operator === '>' && (and['=='] || and['==='])) {
    if (val >= (and['=='] || and['==='])) {
      // condition is always false
      return -9
    } else {
      // do not add
    }
  } else if (operator === '>=' && (and['=='] || and['==='])) {
    if (val > (and['=='] || and['==='])) {
      // condition is always false
      return -9
    } else {
      // do not add
    }
  } else if (operator === '<=' && (and['=='] || and['==='])) {
    if (val < (and['=='] || and['==='])) {
      // condition is always false
      return -9
    } else {
      // do not add
    }
  } else if (operator === '<' && (and['=='] || and['==='])) {
    if (val <= (and['=='] || and['==='])) {
      // condition is always false
      return -9
    } else {
      // do not add
    }
  } else if (operator === '<=' || operator === '<' || operator === '>=' || operator === '>') {
    and[operator] = String(val)
  } else {
    and[operator] = val
  }
}

const orPatch = or => {
  const block = {}
  var inverted

  // (a || b) === !(!a && !b)
  var i = or.length
  while(i--) {
    inverted = {}
    invert(or[i], inverted)
    andPatchTo(block, inverted)
  }

  inverted = {}
  invert(block, inverted)
  return inverted
}

const andPatchTo = (andTo, andFrom) => {
  for (var key in andFrom) {
    if (key === '$or') {
      if (!andTo.$or) {
        andTo.$or = andFrom.$or
      } else {
        var or = andTo.$or.concat(andFrom.$or)
        delete andTo.$or
        andPatchTo(andTo, orPatch(or))
      }
    } else if (key === '$bin') {
      if (!andFrom.$bin) {
        andKill(andTo)
        return
      }
    } else {
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
}

const invert = (test, inverted) => {
  var or = []

  if (test.hasOwnProperty('$bin') && !test.$bin) {
    inverted.$bin = true
  }

  for (var key in test) {
    if (key !== '$or' && key !== '$bin') {
      let and = {}
      var res
      for (var operator in test[key]) {
        res = andPatch(and, invertOperator(operator), test[key][operator])
      }
      if (res !== -9) {
        or.push({ [key]: and })
      }
    }
  }

  if (test.$or) {
    const and = {}
    var i = test.$or.length
    while(i--) {
      invert(test.$or[i], and)
    }
    or.push(and)
  }

  if (or.length > 1) {
    inverted.$or = or
  } else {
    andPatchTo(inverted, or[0])
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

    andPatchTo(resolved, orPatch(or))
  } else {
    parseAnd(test[0], resolved, left)
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
    } else {
      list.push(test)
    }

    andPatchTo(preCondition, inverted)

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

  return list
}

module.exports = ua => {
  const list = []
  parseUA(ua, list, {})
  return list
}
