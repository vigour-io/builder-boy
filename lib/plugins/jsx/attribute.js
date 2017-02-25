const { str, expression, findElem, isEvent } = require('./util')
const { stateExpression } = require('./state')

const JSXAttribute = (node, code, replace) => {
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

exports.JSXAttribute = JSXAttribute
