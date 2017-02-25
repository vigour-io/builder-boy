const { str } = require('./util')
const { stateExpression } = require('./state')

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

module.exports = any
