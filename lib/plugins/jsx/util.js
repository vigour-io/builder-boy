const { walker } = require('../../ast')

const findExpression = node => {
  var prev = node
  var p = node.parent
  while (p) {
    if (p.type === 'Property') {
      return prev
    }
    if (p.type === 'JSXElement') {
      return
    }
    if (p.type === 'ArrowFunctionExpression' || p.type === 'FunctionExpression') {
      return p
    }
    prev = p
    p = p.parent
  }
}

const isEvent = key => /^on[A-Z].+/.test(key)

const findElem = node => {
  var p = node.parent
  while (p) {
    if (p.elem) {
      return p.elem
    }
    p = p.parent
  }
}

const expression = (node, code, replace, trim = 1) => {
  if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
    return code.slice(node.body.start + 0, node.body.end - 0)
  } else if (node.value) {
    return code.slice(node.value.start + trim, node.value.end - trim)
  } else if (node.expression) {
    let nestedJSX
    walker(node.expression, node => {
      if (node.type === 'JSXElement') {
        nestedJSX = true
        return true
      }
    })
    if (nestedJSX) {
      node.expression.nestedJSX = true
      return node.expression
    }
    return code.slice(node.expression.start, node.expression.end)
  }
}

const str = str => `'${str}'` // escape ' etc can also use template literals more safe

exports.str = str
exports.expression = expression
exports.findElem = findElem
exports.isEvent = isEvent
exports.findExpression = findExpression
