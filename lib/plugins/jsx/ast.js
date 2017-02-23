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
      if (!isArray) {
        result.push(`${key}:`)
      }
      if (key === 'text') {
        if (elem[key].val) {
          elem[key].val = elem[key].val.replace(/\s+`$/, '`')
        }
        if (elem[key].$) {
          elem[key].$transform = `(val, state) => {return ${elem[key].val}}`
          delete elem[key].val
        }
      }
      // some more checks e.g is it an object...
      if (typeof elem[key] === 'object') {
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

const expression = (node, code, replace) => {
  if (node.value) {
    return code.slice(node.value.start + 1, node.value.end - 1)
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

const JSXExpressionContainer = (node, code, replace) => {
  if (node.type === 'JSXExpressionContainer' && parent(node, [ 'JSXElement' ])) {
    const elem = findElem(node)
    if (
      node.expression &&
      // also for function expression! -- then do subscription shit
      node.expression.type === 'ObjectExpression'
    ) {
      if (!elem.inject) {
        elem.inject = []
      }
      // also needs state analysis
      // this is wrong want to get transpiled result... same for others
      elem.inject.push(expression(node, code, replace))
    } else {
      const parseState = state(node, code, replace)
      if (parseState.length) {
        let expressionCode = expression(node, code, replace)
        // dependeing what kind of expresion we are doing -- e.g. a function is different since we need to check for map etc
        let $ = {}
        if (parseState.length > 1) {
          $.val = 1 // need to bind this for properties!
        }
        parseState.forEach(val => {
          const last = val[val.length - 1]
          if (last.isFn && last.name === 'compute') {
            // mergeWithPath($, val.slice(0, -1), { val: str('shallow') })
            $ = str(val.slice(0, -1).map(val => val.name).join('.'))
          }
          // replace
        })

        if (parseState.length === 1) {
          const s = node.start
          showcode(code, parseState[0].map(val => val.node))
          let start, end
          for (let i = 0, len = parseState[0].length; i < len; i++) {
            const val = parseState[0][i]
            if (!val.isFn) {
              if (start === void 0) {
                start = val.node.start - s - 2
              }
            } else if (start !== void 0) {
              end = parseState[0][i - 1].node.end - s - 1
            }
          }
          expressionCode = expressionCode.slice(0, start) + expressionCode.slice(end)
          text(node, elem, '${' + expressionCode + '}', $)
        }
        // text(node, elem, '${' + expression(node, code, replace) + '}') -- need to convert to transforms
        // simple just put val on transform in the end
      } else {
        // console.log(node)
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
    // console.log('\n\nLiteral')
    const elem = findElem(node)
    text(node, elem, node.value.replace(/\s+/g, ' ').replace(/\n/g, ''))
    // showcode(code, node)
  }
}

const JSXAtribute = (node, code, replace) => {
  if (node.type === 'JSXAttribute') {
    // console.log('\nJSXAttribute')
    const name = node.name.name
    const elem = findElem(node)
    if (node.value) {
      if (node.value.type === 'JSXExpressionContainer') {
        // this will be handled by a special function
        elem._attributes_[name] = expression(node, code, replace)
      } else if (node.value.type === 'Literal') {
        elem._attributes_[name] = str(node.value.value)
      }
    }
    // showcode(code, node)
  }
}

const JSXElement = (node, code, replace) => {
  if (node.type === 'JSXElement') {
    var pelem = findElem(node)
    var elem
    var replacement
    const expression = findExpression(node)
    if (expression) {
      // console.log('found expression')
      replacement = expression
      elem = expression.elem = { _children_: [], _attributes_: {}, _inExpression_: true }
      pelem = false // do this later for switch, etc etc
    } else {
      // console.log('replace inline!')
      replacement = node
      elem = node.elem = { _children_: [], _attributes_: {} }
    }
    if (!pelem) {
      replace.push(replacement)
    } else {
      pelem._children_.push(elem)
    }

    // console.log('\n\nJSXElement')
    // showcode(code, node)

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

  // can just add this to normal parser
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

  // add elem in replace

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
