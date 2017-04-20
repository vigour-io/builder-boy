const any = require('./any')
const text = require('./text')
const switcher = require('./switch')
const { parent } = require('../../ast')
const { walker } = require('../../ast')
const { str, expression, findElem, findExpression } = require('./util')
const { stateExpression } = require('./state')

const JSXExpressionContainer = (node, code, replace) => {
  if (node.type === 'JSXExpressionContainer' && parent(node, [ 'JSXElement' ])) {
    const elem = findElem(node)
    if (
      node.expression &&
      node.expression.type === 'ObjectExpression'
    ) {
      if (!elem.inject) elem.inject = []
      // can have subscriptions of course... bit confusing -- not supported for now...
      elem.inject.push(expression(node, code, replace))
    } else {
      const subscription = stateExpression(node, code, replace)
      if (subscription) {
        if (subscription.$any) {
          any(elem, subscription, code)
        } else {
          text(node, elem, subscription.code, subscription)
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
    !/^(\n)+$/.test(node.value)
  ) {
    const elem = findElem(node)
    text(node, elem, node.value.replace(/\n/g, ''))
  }
}

const inSwitch = (node) => {
  var p = node
  while (p) {
    if (
      p.type === 'IfStatement' ||
      p.type === 'ConditionalExpression' ||
      p.type === 'LogicalExpression'
    ) {
      return p
    }
    p = p.parent
  }
}

// make hash of object
const JSXElement = (node, code, replace) => {
  if (node.type === 'JSXElement') {
    var pelem = findElem(node)
    var elem, replacement, isSwitcher
    const expression = findExpression(node)
    if (expression) {
      replacement = expression
      if (inSwitch(node)) {
        isSwitcher = true
        elem = node.elem = {
          _children_: [],
          _attributes_: {},
          _inSwitch_: expression
        }
        switcher(expression, elem, node, code, replace)
      } else {
        elem = expression.elem = {
          _children_: [],
          _attributes_: {},
          _inExpression_: true
        }
      }
      pelem = false // do this later for switch -- needs lots of love
    } else {
      replacement = node
      elem = node.elem = { _children_: [], _attributes_: {} }
    }
    if (!pelem) {
      if (!isSwitcher) replace.push(replacement)
    } else {
      pelem._children_.push(elem)
    }
    const tag = node.openingElement.name.name
    if (tag[0].toLowerCase() === tag[0]) {
      elem.tag = str(tag)
    } else {
      if (findIdentifier(node, tag, code)) {
        // console.log('x???', tag)
        // // find file name? - no just use the tag
        // // check if its the same else call it 2, 3
        // if (!elem.inject) {
        //   elem.inject = []
        // }
        // elem.inject.push(`function (elem) {
        //   // if (!global.storage) {
        //   //   global.storage = {}
        //   // }
        //   // global.storage
        //   console.log('ok merge', '${tag}', ${tag})
        //   elem.set(${tag})
        // }`)
        elem._mergeit = tag
      } else {
        elem.type = str(tag)
      }
    }
  }
}

// make a global type object

const findIdentifier = (node, name, code) => {
  var p = node.parent
  var found

  while (p.parent) { p = p.parent }

  walker(p, node => {
    if (node.type === 'Identifier' && node.name === name) {
      found = true
      return true
    }
  })
  if (found) return true
}

exports.JSXElement = JSXElement
exports.JSXLiteral = JSXLiteral
exports.JSXExpressionContainer = JSXExpressionContainer
