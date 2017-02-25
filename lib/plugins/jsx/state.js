const { str, expression } = require('./util')
const { walker, compile } = require('../../ast')
const { logTypeChain, showcode } = require('../../log') //eslint-disable-line

// re-enable when subs work
const mergeWithPath = ($, path, val) => {
  let t = $
  for (let i = 0, len = path.length; i < len; i++) {
    let key = path[i].name
    if (i === len - 1) {
      t[key] = val
    } else {
      if (t[key]) {
        t = t[key]
      } else {
        t[key] = t = {}
      }
    }
  }
}

const parseFn = (node, expressionCode) => {
  let isFn
  if (
      node.value &&
      (node.value.type === 'ArrowFunctionExpression' ||
      node.value.type === 'FunctionExpression')
  ) {
    isFn = true
  }
  if (isFn) {
    expressionCode = expressionCode.slice(node.value.body.start - node.value.start)
    return { _isFn_: expressionCode }
  }
  return expressionCode
}

const state = (node, code, replace) => {
  const states = []
  // multiple of course very important -- need the extra feature in object subs for that
  walker(node, node => {
    if (node.type === 'MemberExpression' && node.object && node.object.name === 'state') {
      const arr = []
      let p = node.parent
      while (p && p.type !== 'JSXExpressionContainer') {
        if (p.type === 'ArrowFunctionExpression' || p.type === 'FunctionExpression') {
          console.log('FOUND NESTED FN EXPRESSION STOP') // need to start handeling this soon (MAP + SWITCH) ==> map will call JSXElement again
          p = false
        } else {
          // also stop if state && fn -- need to leave a marking .state on the node then check if  node.state (that will become the path)
          if (p.object && p.object.property) {
            arr.push({ name: p.object.property.name, node: p.object.property })
          } else if (p.callee && p.callee.property) {
            arr.push({ name: p.callee.property.name, isFn: true, node: p.callee.property })
          }
          p = p.parent
        }
      }
      states.push(arr)
    }
  })
  return states
}

const singleNodeStateExpression = (node, code, replace, expressionCode, safe, trim = 2, keys) => {
  const parseState = state(node, code, replace)

  if (parseState.length) {
    let $ = {}
    let str$, $any
    let localReplace = []
    let multiple$ = []
    if (parseState.length > 1) {
      $.val = 1 // need to bind this for properties!
    }
    parseState.forEach(val => {
      const last = val[val.length - 1]
      const index = val.findIndex(({ name }) => name === 'compute')
      if (index !== -1) {
        mergeWithPath($, val.slice(0, index), { val: str('shallow') })
        str$ = str(val.slice(0, index).map(val => val.name).join('.'))
        multiple$.push(str$)
      } else if (last.isFn && last.name === 'map') {
        // only do this in text else its just a value...
        $any = true
        str$ = str(val.slice(0, -1)
          .map(val => val.name)
          .filter(val => {
            return val !== 'filter' && val !== 'slice' && val !== 'sort'
          }) // need to get rid of more method ofcourse...
          .join('.') + '.$any')
        multiple$.push(str$)
      }
    })

    if (parseState.length === 1) {
      if ($any) {
        expressionCode.$any = parseState[0]
      } else if (!safe) {
        let s = node.start
        let start, end
        if (node.body) {
          s = node.body.start - 2
        }
        for (let i = 0, len = parseState[0].length; i < len; i++) {
          const val = parseState[0][i]
          if (!val.isFn) {
            if (start === void 0) {
              start = val.node.start - s - trim
            }
          } else if (start !== void 0) {
            end = parseState[0][i - 1].node.end - s - trim
            break
          }
        }
        localReplace.push({
          start,
          end,
          val: ''
        })
      }
    } else {
      if ($any) {
        expressionCode.$any = parseState[0]
      } else {
        safe = true
      }
    }

    if (safe && !$any) {
      let s = node.start
      if (node.body) {
        s = node.body.start - 2
      }
      showcode(code, s + trim, s + trim + 1)

      parseState.forEach((parseStateIterate, index) => {
        let start, end
        for (let i = 0, len = parseStateIterate.length; i < len; i++) {
          const val = parseStateIterate[i]
          if (!val.isFn) {
            if (start === void 0) {
              start = val.node.start - s - trim
              break
            }
          }
        }

        var p = parseStateIterate[0].node

        // need to replace all prop memeber with a get array
        // or better with a var...
        while (p) {
          if (p.type === 'CallExpression') {
            showcode(code, p)
            break
          }
          p = p.parent
        }

        let condition = [ `($state${index} = state.get([ ` ]

        for (let i = 0, len = parseStateIterate.length; i < len; i++) {
          const val = parseStateIterate[i]
          if (!val.isFn) {
            condition.push(str(val.node.name))
            condition.push(',')
          } else {
            end = parseStateIterate[i - 1].node.end - s - trim
            break
          }
        }
        if (condition[condition.length - 1] === ',') {
          condition.pop()
        }
        condition.push(' ]))')
        condition = condition.join('')

        localReplace.push({
          start: parseStateIterate[0].node.parent.start - s - trim,
          end,
          val: `\n(${condition} && $state${index}.`
        })

        showcode(code, parseStateIterate[0].node.parent)

        // localReplace.push({
        //   start: parseStateIterate[0].node.parent.start - s - trim,
        //   end,
        //   val: `$state${index}.`
        // })

        // add a default depending on what you are parsing....
        localReplace.push({
          start: p.end - s - trim,
          end: p.end - s - trim,
          val: ')'
        })
      })
    }

    // tmp use $ when objects subs work
    return { replace: localReplace, $: multiple$[0], $any, $multi: multiple$ }
  }
}

const stateExpressionProperty = (node, code, replace, keys) => {
  let object = {}
  // need to support shorthand
  node.properties.forEach(node => {
    const key = node.computed ? `[${node.key.name}]` : node.key.name
    if (node.value && node.value.type === 'ObjectExpression') {
      object[key] = stateExpressionProperty(node.value, code, replace)
    } else {
      let expressionCode = expression(node, code, replace, 0)
      object[key] = expressionCode
      const result = singleNodeStateExpression(node.value, code, replace, expressionCode, false, 1, keys)
      if (result) {
        expressionCode = compile(expressionCode, result.replace).join('')
        object[key] = {
          $: result.$,
          val: parseFn(node, expressionCode)
        }
      }
    }
  })
  return object
}

// needs to be able to handle recursion
const stateExpression = (node, code, replace, safe, keys = [ 'state' ]) => {
  if (node.expression && node.expression.type === 'ObjectExpression') {
    return { object: stateExpressionProperty(node.expression, code, replace, keys) }
  } else {
    let expressionCode = expression(node, code, replace)
    const result = singleNodeStateExpression(node, code, replace, expressionCode, safe, false, keys)
    if (result) {
      if (typeof expressionCode !== 'object') {
        expressionCode = compile(expressionCode, result.replace).join('')
        return { code: parseFn(node, expressionCode), $: result.$, $multi: result.$multi }
      } else {
        return { code: expressionCode, $: result.$, $any: result.$any, $multi: result.$multi }
      }
    }
  }
}

exports.stateExpression = stateExpression
