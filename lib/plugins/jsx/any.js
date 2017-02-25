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
      const subs = stateExpression(node, code, replace, true)
      if (subs) {
        method.push(`.${val.node.name}`)
        method.push('((')
        subs.keys.forEach(key => {
          method.push(`key${key}`)
          method.push(',')
        })
        if (method[method.length - 1] === ',') {
          method.pop()
        }
        const bracket = ') => {'
        method.push(bracket)
        subs.keys.forEach(key => {
          method.push(`var ${key} = $state.get(key${key});`)
        })
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
        subs.$multi.forEach(val => {
          var t = $any
          val.slice(1, -1).split('.').forEach(key => {
            if (!t[key]) t[key] = {}
            t = t[key]
          })
          t.val = str('shallow')
        })

        console.log('xxxx', subs.code)

        if (subs.code[0] === '{') {
          subs.code = subs.code.slice(1, -1)
        } else if (subs.code.indexOf('return') === -1) {
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
