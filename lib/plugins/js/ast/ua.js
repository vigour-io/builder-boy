// const { showcode, parseCharIndex } = require('../util') // eslint-disable-line

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

/*
else {
      // if (node.type === 'Identifier') {
      //   throw new Error(
      //     '!Need to find var Identifier UA -- feature will be added later!' +
      //     parseCharIndex(computed, node.parent.start)
      //   )
      // }
    }
*/

const parseTest = (node, ua, results, computed, array, top, and, isLeft) => {
  if (node.type === 'Literal') {
    if (!isLeft) {
      const r = { [node.parent.operator]: node.value }
      array.push(r)
    }
  } else if (node.type === 'Identifier' || node.type === 'MemberExpression') {
    if (isLeft) {
      const parsed = findUaName(ua, node)
      if (parsed) {
        top._ua_ = true
        let r
        if (and) {
          r = and
          and[parsed] = []
        } else {
          r = { [parsed]: [] }
          array.push(r)
        }
        return [ r, r[parsed] ]
      }
    }
  } else if (node.left) {
    const r = parseTest(node.left, ua, results, computed, array, top, and, true)
    if (node.operator === '&&') {
      if (r && r[1] && r[1][0]) {
        for (let i = 0, len = r[1].length; i < len; i++) {
          parseTest(node.right, ua, results, computed, array, top, r[1][i])
        }
      } else {
        parseTest(node.right, ua, results, computed, array, top)
      }
    } else if (node.operator === '||') {
      // same issue needs to add this
      // console.log('hello', showcode(node, false, computed))
      parseTest(node.right, ua, results, computed, r ? r[1] : array, top)
    } else if (r) {
      parseTest(node.right, ua, results, computed, r[1], top)
    }
    return r
  }
}

const parseUa = (node, ua, results, computed, alternate, file) => {
  if (
    ua.length &&
    (node.type === 'IfStatement' || node.type === 'ConditionalExpression' || alternate) &&
    (node.parent.alternate !== node || alternate)
  ) {
    const obj = node.results || (node.results = {})
    if (node.test) {
      if (!obj.test) obj.test = []
      parseTest(node.test, ua, results, computed, obj.test, obj)
    }
    if (alternate || obj._ua_) {
      delete obj._ua_
      node.conditionUid = file.id.compute() + (results.uid ? results.uid++ : results.uid = 1)
      const parent = addToParent(node, results)
      if (alternate) {
        parent[0].alternate = node.results
      } else {
        parent[0][file.id.compute() + results.uid] = node.results
      }
      if (node.alternate) {
        parseUa(node.alternate, ua, results, computed, true, file)
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
