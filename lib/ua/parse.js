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
      // return something special maybe
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
      // return something special maybe
    }
  } else if ((operator === '===' || operator === '==') && (and['==='] || and['=='] || and['$in'])) {
    // if you have multiple equals, all goes trash
    // unless equals to same value
    if ((operator === '===' || operator === '==') === (and['==='] || and['==']) || (and['$in'] && ~and['$in'].indexOf(val))) {
      // pass
    } else {
      // condition is always false
      // return something special maybe
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
      // return something special maybe
    }
  } else if (operator === '$in' && and['$in']) {
    // if you have double $ins trash all
    // unless equals to same value
    if (and['$in'].find(v => !~val.indexOf(v))) {
      // condition is always false
      // return something special maybe
    } else {
      // pass
    }
  } else if ((operator === '===' || operator === '==') && (and['!=='] || and['!='] || and['$nin'])) {
    // if you have equals first, non-equals doesn't matters later
    if ((operator === '===' || operator === '==') === (and['!=='] || and['!=']) || (and['$nin'] && ~$and['$nin'].indexOf(val))) {
      // condition is always false
      // return something special maybe
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
      // return something special maybe
    } else {
      // pass
    }
  } else if ((operator === '$nin' || operator === '!==' || operator === '!=') && (and['!=='] || and['!='])) {
    // if you have more than one non-equals, you need to merge
    and['$nin'] = [and['!=='] || and['!=']].concat(val)
    delete and['!==']
    delete and['!=']
  } else if ((operator === '!==' || operator === '!=') && and['$nin']) {
    // if you have already merged non equals, add to that
    and['$nin'].push(val)
  } else if ((operator === '>=' || operator === '>') && (and['<'] || and['<='])) {
    // check it it makes a range
    if ((and['<'] || and['<=']) > val) {
      and[operator] = String(val)
    } else if (operator === '>=' && and['<='] && String(val) === and['<=']) {
      delete and['<=']
      and['==='] = String(val)
    } else {
      // condition is always false
      // return something special maybe
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
      // return something special maybe
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
      // pass
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
      // pass
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
    } else if (!andTo[key]) {
      andTo[key] = {}
    }
    for (var operator in andFrom[key]) {
      andPatch(andTo[key], operator, andFrom[key][operator])
    }
  }
}

const invertComparison = (comparison, inverted) => {
  for (var operator in comparison) {
    andPatch(inverted, invertOperator(operator), comparison[operator])
    return inverted
  }
}

const invert = (test, inverted) => {
  var or = []

  for (var key in test) {
    if (key !== '$or') {
      const and = {}
      or.push({ [key]: invertComparison(test[key], and) })
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
      andPatch(resolved[left], key, test[key])
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
