// uid per file is better
var uid = 0

const { showcode, parseCharIndex } = require('../util') // eslint-disable-line

const addToParent = (node, results) => {
  var p = node.parent
  while (p) {
    if (p.conditionUid) {
      return [ p.results, p ]
    }
    p = p.parent
  }
  return [ results ]
}

// const addConditional = (node, results, alternate, computed) => {
//   if (!node.conditionUid) {
//     node.results = {}
//   }
//   return [ node.results ]
// }

const findUaName = (ua, node) => {
  for (let i = 0, len = ua.length; i < len; i++) {
    if (ua[i].type === 'imports') {
      for (let key in ua[i].exports) {
        // check default as well
        if (ua[i].exports[key][0] === node.name) {
          return ua[i].exports[key][1]
        }
      }
    } else if (ua[i].type === 'require') {
      console.log('do requires!')
    }
  }
}

const parseTest = (node, ua, results, computed, condition, isLeft, fromTop, top) => {
  if (node.type === 'Literal') {
    if (!isLeft && !fromTop) {
      if (!condition[node.parent.operator]) condition[node.parent.operator] = []
      condition[node.parent.operator].push(node.value)
    }
  } else if (node.type === 'Identifier') {
    if (isLeft) {
      const parsed = findUaName(ua, node)
      if (parsed) {
        top._ua_ = true
        if (!condition[parsed]) condition[parsed] = []
        const r = {}
        condition[parsed].push(r)
        return r
      }
    } else {
      throw new Error(
        'Need to find var for UA -- feature will be added later!' +
        parseCharIndex(computed, node.parent.start)
      )
    }
  } else if (node.left) {
    const r = parseTest(node.left, ua, results, computed, condition, true, false, top)
    if (r && node.operator !== '||') {
      parseTest(node.right, ua, results, computed, r, false, false, top)
    } else {
      parseTest(node.right, ua, results, computed, condition, false, true, top)
    }
    return r
  }
}

const parseUa = (node, ua, results, computed, alternate) => {
  if (
    ua.length &&
    (node.type === 'IfStatement' || node.type === 'ConditionalExpression' || alternate) &&
    (node.parent.alternate !== node || alternate)
  ) {
    // dont add if not nessecary of course
    const obj = node.results || (node.results = {})
    if (node.test) {
      if (!obj.test) obj.test = {}
      parseTest(node.test, ua, results, computed, obj.test, false, true, obj)
    }

    console.log(obj)
    if (alternate || obj._ua_) {
      delete obj._ua_
      node.conditionUid = ++uid
      const parent = addToParent(node, results)
      // just add where to add but only add if its real...
      if (alternate) {
        parent[0].alternate = node.results
      } else {
        parent[0][uid] = node.results
      }
      if (node.alternate) {
        parseUa(node.alternate, ua, results, computed, true)
      }
    }
  }
}

// will become generalized
const handleUa = (ua, imports) => {
  //  exports: { default: 'app' } }
  if (imports.file === 'vigour-ua/navigator') {
    ua.push(imports)
  }
}

exports.parseUa = parseUa
exports.handleUa = handleUa
