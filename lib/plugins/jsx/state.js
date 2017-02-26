const { str, expression, findExpression } = require('./util')
const { walker, compile } = require('../../ast')
const { logTypeChain, showcode } = require('../../log') //eslint-disable-line
const chalk = require('chalk')

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

const state = (node, code, replace, keys) => {
  const states = []
  walker(node, node => {
    let key
    if (
      node.type === 'MemberExpression' &&
      node.object &&
      node.object.name &&
      (key = keys.includes(node.object.name) && node.object.name)
    ) {
      const arr = []
      let p = node.parent
      while (p && p.type !== 'JSXExpressionContainer' && p.type !== 'JSXElement') {
        if (p.type === 'ArrowFunctionExpression' || p.type === 'FunctionExpression') {
          p = false
        } else {
          if (p.object && p.object.property) {
            arr.push({ name: p.object.property.name, node: p.object.property, key })
          } else if (p.callee && p.callee.property) {
            const name = p.callee.property.name
            if ((
              name === 'root' ||
              name === 'parent' ||
              name === 'origin'
            ) && !p.arguments.length) {
              // only when no ARGUMENTS
              arr.push({ name, node: p.callee.property, key, brackets: true })
            } else {
              arr.push({ name, isFn: true, node: p.callee.property, key })
            }
          }
          p = p.parent
        }
      }
      states.push(arr)
    } else if (node.type === 'JSXElement') {
      return true
    }
  })
  return states
}

const singleNodeStateExpression = (node, code, replace, expressionCode, safe, keys, trim = 2) => {
  const parseState = state(node, code, replace, keys)

  if (parseState.length) {
    let $ = {}
    let str$, $any
    let localReplace = []
    let multiple$ = []
    if (parseState.length > 1) {
      $.val = 1 // need to bind this for properties!
    }
    parseState.forEach(val => {
      if (val.length) {
        const last = val[val.length - 1]
        const index = val.findIndex(({ name }) =>
          name === 'compute' ||
          name === 'get'
        )
        if (index !== -1) {
          mergeWithPath($, val.slice(0, index), { val: str('shallow') })
          str$ = str(val.slice(0, index).map(val => val.name).join('.'))
          multiple$.push(str$)
        } else if (last.isFn && last.name === 'map') {
          $any = true
          str$ = str(val.slice(0, -1)
            .map(val => val.name)
            .filter(val => {
              return val !== 'filter' &&
                val !== 'slice' &&
                val !== 'sort' &&
                val !== 'every' &&
                val !== 'reverse' &&
                val !== 'find'
            })
            .join('.') + '.$any')
          multiple$.push(str$)
        }
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

      parseState.forEach((parseStateIterate, index) => {

        console.log('----------')
        showcode(code, parseStateIterate.map(({ node }) => node))

        if (parseStateIterate.length) {
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
          while (p) {
            if (p.type === 'CallExpression') {
              if (p.callee.property.name !== 'root' && p.callee.property.name !== 'parent') {
                break
              }
            }
            p = p.parent
          }

          console.log(parseStateIterate[0])

          let condition = [ `($state${index} = ${parseStateIterate[0].key}.get([ ` ]

          for (let i = 0, len = parseStateIterate.length; i < len; i++) {
            const val = parseStateIterate[i]
            if (!val.isFn) {
              condition.push(str(val.node.name))
              condition.push(',')
            } else {
              if (i) {
                end = parseStateIterate[i - 1].node.end - s - trim + (parseStateIterate[i - 1].brackets ? 2 : 0)
              }
              break
            }
          }
          if (condition[condition.length - 1] === ',') condition.pop()
          condition.push(' ]) )')
          condition = condition.join('')

          if (end) {
            localReplace.push({
              start: parseStateIterate[0].node.parent.start - s - trim,
              end: end,
              val: `\n(${condition} && $state${index}.`
            })
            localReplace.push({
              start: p.end - s - trim,
              end: p.end - s - trim,
              val: ')'
            })
            // need a different trim value for this...
            // console.log(node.expression)
            // let xx = expression(node, code, replace)
            // console.log(chalk.cyan(xx))
            // console.log(localReplace.map(({ start, end}) => console.log(start, end)))
            // showcode(xx, localReplace)
            // console.log('-----------HELLO---------')
          }
        }
      })
    }

    return {
      replace: localReplace,
      $: multiple$[0], // this will all become object when render is streamlined
      $object: $,
      $any,
      $multi: multiple$
    }
  }
}

const stateExpressionProperty = (node, code, replace, keys) => {
  let object = {}
  // need to support shorthand
  node.properties.forEach(node => {
    const key = node.computed ? `[${node.key.name}]` : node.key.name
    if (node.value && node.value.type === 'ObjectExpression') {
      object[key] = stateExpressionProperty(node.value, code, replace, keys)
    } else {
      let expressionCode = expression(node, code, replace, 0)
      object[key] = expressionCode
      const result = singleNodeStateExpression(node.value, code, replace, expressionCode, false, keys, 1)
      if (result) {
        expressionCode = compile(expressionCode, result.replace).join('')

        // needs much more of course
        object[key] = {
          $: result.$, // use object!
          val: parseFn(node, expressionCode)
        }
      }
    }
  })
  return object
}

const stateExpression = (node, code, replace, safe, keys) => {
  if (!keys) {
    let expression = findExpression(node, true)
    if (!expression) expression = node
    if (expression.params) {
      keys = expression.params.map(({ name }) => name)
    } else if (expression.arguments) {
      keys = expression.arguments.map(({ name }) => name)
    }
  }

  if (node.expression && node.expression.type === 'ObjectExpression') {
    return { object: stateExpressionProperty(node.expression, code, replace, keys), keys }
  } else {
    let expressionCode = expression(node, code, replace)
    const result = singleNodeStateExpression(node, code, replace, expressionCode, safe, keys)
    if (result) {
      if (typeof expressionCode !== 'object') {

        // console.log(expressionCode)

        expressionCode = compile(expressionCode, result.replace).join('')

        // console.log('---->', result.$object)
        // console.log(expressionCode)
        // console.log('-------------')

        return {
          code: parseFn(node, expressionCode), // make this a bit better
          $: result.$,
          $multi: result.$multi,
          $object: result.$object,
          keys
        }
      } else {
        return {
          code: expressionCode,
          $: result.$,
          $any: result.$any,
          $multi: result.$multi,
          keys
        }
      }
    }
  }
}

exports.stateExpression = stateExpression
