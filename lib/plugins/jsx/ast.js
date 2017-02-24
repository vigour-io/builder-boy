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
  if (node.value) {
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
      node.expression.needsTranspilation = true
      return node.expression
    }
    return code.slice(node.expression.start, node.expression.end)
  }
}

const singleNodeStateExpression = (node, code, replace, expressionCode, trim = 2) => {
  const parseState = state(node, code, replace)
  if (parseState.length) {
    let $ = {}
    let str$
    let localReplace = []
    if (parseState.length > 1) {
      $.val = 1 // need to bind this for properties!
    }
    parseState.forEach(val => {
      const last = val[val.length - 1]
      if (last.isFn && last.name === 'compute') {
        mergeWithPath($, val.slice(0, -1), { val: str('shallow') })
        // tmp when object subs do not work
        str$ = str(val.slice(0, -1).map(val => val.name).join('.'))
      }
    })

    if (parseState.length === 1) {
      const s = node.start
      // showcode(code, node)
      // showcode(code, parseState[0].map(val => val.node))
      let start, end
      for (let i = 0, len = parseState[0].length; i < len; i++) {
        const val = parseState[0][i]
        if (!val.isFn) {
          if (start === void 0) {
            start = val.node.start - s - trim
          }
        } else if (start !== void 0) {
          end = parseState[0][i - 1].node.end - s - trim
        }
      }

      localReplace.push({
        start,
        end,
        val: ''
      })

      showcode(expressionCode, localReplace)
    }
    // tmp use $ when objects subs work
    return { replace: localReplace, $: str$ }
  }
}

const stateExpressionProperty = (node, code, replace) => {
  let object = {}

  // need to support compute and shorthand
  node.properties.forEach(node => {
    const key = node.computed ? `[${node.key.name}]` : node.key.name

    if (node.value && node.value.type === 'ObjectExpression') {
      object[key] = stateExpressionProperty(node.value, code, replace)
    } else {
      let expressionCode = expression(node, code, replace, 0)
      object[key] = expressionCode
      const result = singleNodeStateExpression(node.value, code, replace, expressionCode, 1)
      if (result) {
        showcode(expressionCode, result.replace)
        expressionCode = compile(expressionCode, result.replace).join('')
        object[key] = {
          $: result.$,
          val: expressionCode
        }
      }
    }
  })
  return object
}

// needs to be able to handle recursion
const stateExpression = (node, code, replace, elem) => {
  if (node.expression && node.expression.type === 'ObjectExpression') {
    return { object: stateExpressionProperty(node.expression, code, replace) }
  } else {
    let expressionCode = expression(node, code, replace)
    const result = singleNodeStateExpression(node, code, replace, expressionCode)
    if (result) {
      expressionCode = compile(expressionCode, result.replace).join('')
      return { code: expressionCode, $: result.$ }
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
        if (
          !node.value.expression ||
          (node.value.expression.type !== 'ArrowFunctionExpression' &&
          node.value.expression.type !== 'FunctionExpression')
        ) {
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
      const subscription = stateExpression(node, code, replace, elem)
      if (subscription) {
        // can also do object of course for attr
        if (subscription.$any) {
          // has map and !end on reduce or length
          // for now just do ends on .map
          console.log('lets set dat any right hur')
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
      key !== '_parsed_'
    ) {
      if (!isArray) result.push(`${key}:`)

      if (key === 'text' && elem[key].val) {
        elem[key].val = elem[key].val.replace(/\s+`$/, '`')
      }
      // some more checks e.g is it an object...
      if (typeof elem[key] === 'object') {
        if (elem[key].$) {
          elem[key].$transform = `(val, state) => {return ${elem[key].val}}`
          delete elem[key].val
        }

        if (elem[key].needsTranspilation) {
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
      if (/^on[A-Z].+/.test(key)) {
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
  var expression = code.slice(elem[key].start, elem[key].end)
  var correction = 0
  replace.forEach(val => {
    if (val.start >= elem[key].start && val.end <= elem[key].end) {
      const str = parseCode(val.elem, replace, code).join('')
      const s = val.start - elem[key].start + correction
      const e = val.end - elem[key].start + correction
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
