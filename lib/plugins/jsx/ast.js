const acornjsx = require('acorn-jsx')
const beautify = require('js-beautify')
const { logTypeChain, showcode } = require('../../log') //eslint-disable-line
const { walker, compile, parent } = require('../../ast')

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

const str = str => `'${str}'` // escape ' etc can also use template literals more safe

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

const singleNodeStateExpression = (node, code, replace, expressionCode, safe, trim = 2) => {
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
      parseState.forEach((parseStateIterate, index) => {
        let s = node.start
        let start
        if (node.body) {
          s = node.body.start - 2
        }
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
            showcode(code, p)
            break
          }
          p = p.parent
        }
        // showcode(code, parseStateIterate[0].node.parent.parent.parent.parent.parent)
        // need to know where and expression ends....

        let condition = [ 'state.get([ ' ]

        for (let i = 0, len = parseStateIterate.length; i < len; i++) {
          const val = parseStateIterate[i]
          if (!val.isFn) {
            condition.push(str(val.node.name))
            condition.push(',')
          } else {
            break
          }
        }
        if (condition[condition.length - 1] === ',') {
          condition.pop()
        }
        condition.push(' ])')
        condition = condition.join('')

        localReplace.push({
          start: parseStateIterate[0].node.parent.start - s - trim,
          end: parseStateIterate[0].node.parent.start - s - trim,
          val: `(${condition} && `
        })

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

const stateExpressionProperty = (node, code, replace) => {
  let object = {}
  // need to support shorthand
  node.properties.forEach(node => {
    const key = node.computed ? `[${node.key.name}]` : node.key.name
    if (node.value && node.value.type === 'ObjectExpression') {
      object[key] = stateExpressionProperty(node.value, code, replace)
    } else {
      let expressionCode = expression(node, code, replace, 0)
      object[key] = expressionCode
      const result = singleNodeStateExpression(node.value, code, replace, expressionCode, false, 1)
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
const stateExpression = (node, code, replace, safe) => {
  if (node.expression && node.expression.type === 'ObjectExpression') {
    return { object: stateExpressionProperty(node.expression, code, replace) }
  } else {
    let expressionCode = expression(node, code, replace)
    const result = singleNodeStateExpression(node, code, replace, expressionCode, safe)
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

// const parseMethod = () => {

// }

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

const parseCode = (elem, replace, code, result = []) => {
  const isArray = Array.isArray(elem)
  result.push(isArray ? '[' : '{')
  for (let key in elem) {
    if (
      key !== '_children_' &&
      key !== '_attributes_' &&
      key !== '_inExpression_' &&
      key !== '_parsed_' &&
      key !== '_isFn_'
    ) {
      if (!isArray) result.push(`${key}:`)

      if (key === 'text' && elem[key].val) {
        elem[key].val = elem[key].val.replace(/\s+`$/, '`')
      }
      // some more checks e.g is it an object...
      if (typeof elem[key] === 'object') {
        if (elem[key].$ && elem[key].val) {
          // can add variable mapping as well (later)
          if (elem[key].val._isFn_) {
            elem[key].$transform = `($val, state) => ${elem[key].val._isFn_}`
          } else {
            elem[key].$transform = `($val, state) => {return ${elem[key].val}}`
          }
          delete elem[key].val
        }

        if (elem[key].nestedJSX) {
          expressionCompilation(replace, code, elem, key, result)
        } else {
          parseCode(elem[key], replace, code, result)
        }
      } else {
        result.push(elem[key])
      }
      result.push(',')
    }
  }

  if (elem._children_) {
    elem._children_.forEach((val, key) => {
      // this key can be a bit more safe when adding to other elements
      key = 'child' + key
      if (val._attributes_ && val._attributes_.key) {
        key = val._attributes_.key
        if (key[0] !== "'" && key[0] !== '"') key = `[${key}]`
      }
      result.push(`${key}:`)
      result.push(parseCode(val, replace, code).join(''))
      result.push(',')
    })
  }

  if (elem._attributes_ && Object.keys(elem._attributes_).length) {
    let block, on
    if (elem._attributes_.key) {
      delete elem._attributes_.key
    }

    for (let key in elem._attributes_) {
      if (isEvent(key)) {
        console.log('EVENT')
        if (!on) on = {}
        let event = key.slice(2)
        event = event[0].toLowerCase() + event.slice(1)
        on[event] = elem._attributes_[key]
        delete elem._attributes_[key]
      }
    }

    block = !Object.keys(elem._attributes_).length

    if (!block) {
      result.push('resolveAttr:')
      parseCode(elem._attributes_, replace, code, result)
      result.push(',')
    }

    if (on) {
      result.push('on:')
      parseCode(on, replace, code, result)
      result.push(',')
    }
  }

  elem._parsed_ = true
  if (result[result.length - 1] === ',') result.pop()
  result.push(isArray ? ']' : '}')
  return result
}

// need this skipping behvaiour for functions as well (in any)
// dont really need it for switches
// could also change the actual parsed result as a solution -- add it to the element
// first make the elements then do the ractual replaces (probably the nest)

// this is super temporary -- needs to be done differently also need to attach to switch or props default for example
// how to map to props default? -- similair needTranspilation
const expressionCompilation = (replace, code, elem, key, result) => {
  var expression
  var start, end
  if (elem[key].$any) {
    start = elem[key].arguments[0].start
    end = elem[key].arguments[0].end
  } else {
    start = elem[key].start
    end = elem[key].end
  }
  expression = code.slice(start, end)

  var correction = 0
  replace.forEach(val => {
    if (val.start >= start && val.end <= end) {
      const str = parseCode(val.elem, replace, code).join('')
      const s = val.start - start + correction
      const e = val.end - start + correction
      const l = expression.slice(0, s)
      const r = expression.slice(e)
      const old = val.end - val.start
      const newl = str.length
      correction += newl - old
      expression = l + str + r
    }
  })
  result.push(expression)
}

// were going to use this for the normal ast transpiler way cleaner
// keep most expresion intact only thing we need to analyze if if something is state -- thats step 1
