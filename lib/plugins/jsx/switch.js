const { str } = require('./util')
const { walker } = require('../../ast')
const { stateExpression } = require('./state')
const { logTypeChain, showcode } = require('../../log') //eslint-disable-line

const switcher = (expression, elem, node, code, replace) => {
  var switcher
  if (!expression.elem) {
    replace.push(expression)
    switcher = expression.elem = {
      _children_: [], _attributes_: {}, _switches_: [], $switch: {}, $: str('$switch')
    }
    const subs = stateExpression(expression, code, [], true)

    var result = subs.code || code.slice(expression.body.start, expression.body.end)
    var cnt = 0
    var method = [ `(${subs ? subs.keys[0] : '$state'}) => {` ]
    if (subs) {
      method.push('var ')
      subs.$multi.forEach((val, index) => {
        method.push(`$state${index}`)
        method.push(',')
      })
      if (method[method.length - 1] === 'var ') {
        method.pop()
      } else if (method[method.length - 1] === ',') {
        method.pop()
        method.push(';')
      }
    }
    if (result[0] === '{') {
      result = result.slice(1, -1)
    } else if (result.indexOf('return') === -1) {
      method.push('return ')
    }
    walker(expression, node => {
      if (node.type === 'JSXElement') {
        const element = code.slice(node.start, node.end)
        result = result.replace(element, `"child${cnt}"`)
        cnt++
        return true
      }
    })
    method.push(result)
    method.push('}')
    switcher.$switch.val = method.join('')
    if (subs) {
      subs.$multi.forEach(val => {
        if (val !== `''`) {
          var t = switcher.$switch
          val.slice(1, -1).split('.').forEach(key => {
            if (!t[key]) t[key] = {}
            t = t[key]
          })
          t.val = str('shallow')
        }
      })
    }
  } else {
    switcher = expression.elem
  }
  switcher._switches_.push(elem)
}

module.exports = switcher
