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

const findUaName = (ua, node) => {
  for (let i = 0, len = ua.length; i < len; i++) {
    if (ua[i] && ua[i].type === 'imports' || ua[i].exports && ua[i].exports.default) {
      if (node.type === 'MemberExpression') {
        if (node.object.name && ua[i].exports.default === node.object.name) {
          return node.property.name
        }
      } else {
        for (let key in ua[i].exports) {
          if (ua[i].exports[key][0] === node.name) {
            return ua[i].exports[key][1]
          }
        }
      }
    } else if (ua[i].objectPattern) {
      for (let j = 0, len = ua[i].objectPattern.length; j < len; j++) {
        let val = ua[i].objectPattern[j]
        if (val.val === node.name) {
          return node.name
        } else if (val.key && val.val.name === node.name) {
          return val.key.name
        }
      }
    }
  }
}

const parseTest = (node, ua, results, computed, condition, isLeft, fromTop, top) => {
  if (node.type === 'Literal') {
    if (!isLeft && !fromTop) {
      if (!condition[node.parent.operator]) condition[node.parent.operator] = []
      condition[node.parent.operator].push(node.value)
    }
  } else if (node.type === 'Identifier' || node.type === 'MemberExpression') {
    if (isLeft) {
      const parsed = findUaName(ua, node)
      if (parsed) {
        console.log(parsed)
        showcode(node, false, computed)
        top._ua_ = true
        if (!condition[parsed]) condition[parsed] = []
        const r = {}
        condition[parsed].push(r)
        return r
      }
    } else {
      // if (node.type === 'Identifier') {
      //   throw new Error(
      //     '!Need to find var Identifier UA -- feature will be added later!' +
      //     parseCharIndex(computed, node.parent.start)
      //   )
      // }
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
    const obj = node.results || (node.results = {})
    if (node.test) {
      if (!obj.test) obj.test = {}
      parseTest(node.test, ua, results, computed, obj.test, false, true, obj)
    }
    if (alternate || obj._ua_) {
      // delete obj._ua_
      node.conditionUid = ++uid
      const parent = addToParent(node, results)
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

const handleUa = (ua, imports) => {
  if (imports.file === 'vigour-ua/navigator') {
    ua.push(imports)
    return true
  }
}

exports.parseUa = parseUa
exports.handleUa = handleUa
