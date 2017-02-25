const any = require('./any')
const { parent } = require('../../ast')
const { str, expression, findElem, findExpression } = require('./util')
const { stateExpression } = require('./state')

const text = (node, elem, val, $) => {
  if (!elem.text) elem.text = {}
  if ($) elem.text.$ = $
  if (elem.text.val === void 0) {
    elem.text.val = '``'
    val = val.replace(/^\s+/, '')
  }
  elem.text.val = elem.text.val.slice(0, -1)
  elem.text.val += val + '`'
}

const JSXExpressionContainer = (node, code, replace) => {
  if (node.type === 'JSXExpressionContainer' && parent(node, [ 'JSXElement' ])) {
    const elem = findElem(node)
    if (
      node.expression &&
      node.expression.type === 'ObjectExpression'
    ) {
      if (!elem.inject) {
        elem.inject = []
      }
      // can have subscriptions of course.. bit confusing
      elem.inject.push(expression(node, code, replace))
    } else {
      const subscription = stateExpression(node, code, replace)
      if (subscription) {
        // can also do object of course for attr
        if (subscription.$any) {
          any(elem, subscription, code)
        } else {
          text(node, elem, '${' + subscription.code + '}', subscription.$)
        }
      } else {
        text(node, elem, '${' + expression(node, code, replace) + '}')
      }
    }
  }
}

const JSXLiteral = (node, code, replace) => {
  if (
    node.type === 'Literal' &&
    parent(node, [ 'JSXElement' ]) && // not for attr!
    node.value &&
    node.value !== '\n' &&
    !/^\s+$/.test(node.value)
  ) {
    const elem = findElem(node)
    text(node, elem, node.value.replace(/\s+/g, ' ').replace(/\n/g, ''))
  }
}

const JSXElement = (node, code, replace) => {
  if (node.type === 'JSXElement') {
    var pelem = findElem(node)
    var elem, replacement
    const expression = findExpression(node)
    if (expression) {
      replacement = expression
      elem = expression.elem = { _children_: [], _attributes_: {}, _inExpression_: true }
      pelem = false // do this later for switch -- needs lots of love
    } else {
      replacement = node
      elem = node.elem = { _children_: [], _attributes_: {} }
    }
    if (!pelem) {
      replace.push(replacement)
    } else {
      pelem._children_.push(elem)
    }

    const tag = node.openingElement.name.name
    if (tag[0].toLowerCase() === tag[0]) {
      elem.tag = str(tag)
    } else {
      console.log('IS AN ELEMENT -- use type OR scoped var')
    }
  }
}

exports.JSXElement = JSXElement
exports.JSXLiteral = JSXLiteral
exports.JSXExpressionContainer = JSXExpressionContainer
