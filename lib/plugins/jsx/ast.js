const acornjsx = require('acorn-jsx')
const beautify = require('js-beautify')
const { logTypeChain, showcode } = require('../../log') //eslint-disable-line
const { walker, compile, parent } = require('../../ast')
const { str, expression, findElem, isEvent, findExpression } = require('./util')
const { stateExpression } = require('./state')
const parseCode = require('./compile')

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

const any = (elem, subscription, code) => {
  var $ = subscription.$
  const methods = subscription.code.$any.slice(0, -1).filter(val => val.isFn)
  var result = elem
  var $any
  if (methods.length) {
    $any = {}
    let method = []
    method.push('(keys, $state) => keys')
    methods.forEach(val => {
      const replace = []
      const node = val.node.parent.parent.arguments[0]
      const subs = stateExpression(node, code, replace, true) // add option "make into conditionals"
      if (subs) {
        // special handeling for sort
        // can can collect the subs easyly
        // instead of just state where going to do an identifier you can pass
        // can also be an array so we catch a && b for example for sort
        method.push('.' + val.node.name + '(key => { const state = $state.get(key);')
        method.push('var ')
        subs.$multi.forEach((val, index) => {
          method.push(`$state${index}`)
          method.push(',')
        })
        if (method[method.length - 1] === ',') {
          method.pop()
        }
        method.push(';')
        subs.$multi.forEach(val => {
          var t = $any
          val.slice(1, -1).split('.').forEach(key => {
            if (!t[key]) t[key] = {}
            t = t[key]
          })
          t.val = str('shallow')
        })
        if (subs.code.indexOf('return') === -1) {
          method.push('return ')
        }
        method.push(subs.code)
        method.push('})')
      } else {
        method.push('.' + val.node.name + '(')
        val.node.parent.parent.arguments.forEach(val => {
          method.push(code.slice(val.start, val.end))
          method.push(',')
        })
        if (method[method.length - 1] === ',') method.pop()
        method.push(')')
      }
    })
    $any.val = method.join('')
  }

  if (elem.text && elem.text.$ || elem._children_.length) {
    result = { tag: '\'fragment\'' }
    elem._children_.push(result)
  }
  result.$ = $
  if ($any) result.$any = $any
  if (!result.props) result.props = {}
  result.props.default = subscription.code
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

const JSXAtribute = (node, code, replace) => {
  if (node.type === 'JSXAttribute') {
    const name = node.name.name
    const elem = findElem(node)
    if (node.value) {
      if (node.value.type === 'JSXExpressionContainer') {
        let subscription
        if (!isEvent(name)) {
          subscription = stateExpression(node.value, code, replace, elem)
        }
        if (subscription) {
          if (subscription.object) {
            elem._attributes_[name] = subscription.object
          } else {
            elem._attributes_[name] = {
              val: subscription.code,
              $: subscription.$
            }
          }
        } else {
          elem._attributes_[name] = expression(node, code, replace)
        }
      } else if (node.value.type === 'Literal') {
        elem._attributes_[name] = str(node.value.value)
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

module.exports = file => new Promise(resolve => {
  const code = file.code.compute()
  const ast = acornjsx.parse(code, {
    plugins: {
      jsx: true
    },
    sourceType: 'module'
  })
  const replace = []
  walker(ast, node => {
    JSXElement(node, code, replace)
    JSXLiteral(node, code, replace)
    JSXAtribute(node, code, replace)
    JSXExpressionContainer(node, code, replace)
  })
  replace.forEach(val => {
    if (!val.elem._parsed_) {
      val.val = parseCode(val.elem, replace, code).join('')
    }
  })
  const result = beautify(compile(code, replace).join(''), { indent_size: 2 })
  console.log('--------------------------')
  console.log(result)
  console.log('--------------------------')
  resolve({ result: result })
})

// were going to use this for the normal ast transpiler way cleaner
// keep most expresion intact only thing we need to analyze if if something is state -- thats step 1
